---
title: SpringBoot实现RabbitMQ动态加载
categories: 
	- SpringBoot
tags: 
	- RabbitMQ
	- Nacos
	
date: 2024-03-19 17:24:20
updated: 2024-03-19 17:24:20

---
<!-- toc -->

## <span id="inline-blue">环境</span>
SpringBoot : 2.2.6.RELEASE
SpringCloud : 2021.0.5
RabbitMQ : 3.8.8
Nacos : 2.1.1
## <span id="inline-blue">背景</span>
Spring微服务集成RabbitMQ，项目启动加载RabbitMQ连接失败导致项目无法启动，增加配置项控制RabbitMQ有条件加载。
## <span id="inline-blue">实现</span>
nacos上对应模块配置文件增加配置项
```properties
spring.rabbitmq.enable=true
```

启动类注解排除RabbitMQ默认配置
```Java
@SpringBootApplication(exclude = {RabbitAutoConfiguration.class})
public class FfcsAdminBizApplication {
    public static void main(final String[] args) {
        SpringApplication.run(FfcsAdminBizApplication.class, args);
    }
}
```
RabbitConfig增加配置自动刷新、@RabbitCondition注解
```Java
@RefreshScope
@Slf4j
@Configuration
@Conditional(RabbitConfig.RabbitCondition.class)
public class RabbitConfig extends org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration {

    /**
     * 队列
     */
    public static final String QUEUE = "log";


    /**
     *   * 交换机
     *  
     */
    public static final String EXCHANGE = "log_exchange";

    /**
     *   * 路由键值
     *  
     */
    public static final String LOG_ROUTING_KEY = "log_routing";

    /**
     * 发送一个批次中消息的数量
     */
    @Value("${rabbitmq.batch.size:100}")
    private int batchSize;

    /**
     *     * 批量消息的最大大小;如果超过了此值，它会取代batchSize, 并导致要发送的部分批处理
     *  
     */
    @Value("${rabbitmq.batch.bufferLimit:1024}")
    private int bufferLimit;

    /**
     *     * 当没有新的活动添加到消息批处理时之后，超时将触发批量提交
     *  
     */
    @Value("${rabbitmq.batch.timeOut:10000}")
    private long timeOut;


    /**
     * 自动创建交换机
     */
    @Conditional(RabbitCondition.class)
    @Bean
    public DirectExchange directExchange() {
        return new DirectExchange(EXCHANGE);
    }

    /**
     * 自动创建队列
     */
    @Conditional(RabbitCondition.class)
    @Bean
    public Queue createBatchQueue() {
        return new Queue(QUEUE);
    }


    /**
     *     * 自己将队列绑定到交换机，路由键使用队列名
     */
    @Conditional(RabbitCondition.class)
    @Bean
    public Binding directBinding() {
        return BindingBuilder.bind(createBatchQueue()).to(directExchange()).withQueueName();
    }


    /**
     *  * 使用定时任务线程池，定时从队列中拉取数据
     */
    @Conditional(RabbitCondition.class)
    @Bean("batchQueueTaskScheduler")
    public TaskScheduler batchQueueTaskScheduler() {
        return new ThreadPoolTaskScheduler();
    }

    /**
     *     * 批量处理rabbitTemplate
     * 该策略只支持一个exchange/routingKey
     *  
     */
    @Conditional(RabbitCondition.class)
    @Bean("batchQueueRabbitTemplate")
    public BatchingRabbitTemplate batchQueueRabbitTemplate(ConnectionFactory connectionFactory, @Qualifier("batchQueueTaskScheduler") TaskScheduler taskScheduler) {
        BatchingStrategy batchingStrategy = new SimpleBatchingStrategy(batchSize, bufferLimit, timeOut);
        return new BatchingRabbitTemplate(connectionFactory, batchingStrategy, taskScheduler);
    }

    /**
     *   * 配置监听容器
     */
    @Conditional(RabbitCondition.class)
    @Bean("batchQueueRabbitListenerContainerFactory")
    public SimpleRabbitListenerContainerFactory batchQueueRabbitListenerContainerFactory(ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        //配置一个BatchMessageListenerAdapter
        factory.setBatchListener(true);
        // 允许创建批量消息
        factory.setConsumerBatchEnabled(true);
        factory.setBatchSize(batchSize);
        return factory;
    }

    public static class RabbitCondition extends AllNestedConditions {

        RabbitCondition() {
            super(ConfigurationPhase.PARSE_CONFIGURATION);
        }

        @ConditionalOnProperty(prefix = "spring.rabbitmq", name = "enable", havingValue = "true")
        static class EnableProperty {
        }
    }
}
```

生产者：

```Java
@RestController
@Api(tags = {"日志"})
public class LogController extends BaseController {
    @Autowired
    private  LogApiService apiLogService;
    @Autowired
    private  LogLoginService loginLogService;
    @Autowired
    private DocumentService documentService;

    @Autowired
    private RedisUtils redisUtils;

    @Autowired
    private ElasticSearchConfiguration configuration;
    @Autowired(required = false)
	private BatchingRabbitTemplate batchQueueRabbitTemplate;
	
	 @PostMapping({"/log/api"})
    @ApiOperation("保存日志信息")
    public ApiResponse save(@RequestBody  LogApi apiLog) {

        if (configuration.isRabbitmqSupport()) {
            Message message = new Message(JSON.toJSONString(apiLog).getBytes(), new MessageProperties());
            message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
            this.batchQueueRabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.QUEUE, message);
            return success(true);
        } 
	}
}
```

消费者：
```Java
@Slf4j
@Component
@Conditional(RabbitConfig.RabbitCondition.class)
public class RabbitMQReceiver implements BatchMessageListener {

    @Autowired
    private LogApiService apiLogService;

    @Autowired
    private ElasticSearchConfiguration configuration;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private RedisUtils redisUtils;

    private String index = "es_log_api_";

    @Override
    @RabbitListener(bindings = @QueueBinding(value = @Queue(value = RabbitConfig.QUEUE), exchange = @Exchange(RabbitConfig.EXCHANGE), key = RabbitConfig.QUEUE), containerFactory = "batchQueueRabbitListenerContainerFactory")
    public void onMessageBatch(List<Message> messages) {

        try {
            if (CollectionUtils.isEmpty(messages)) {
                return;
            }
            List<LogApi> LogApiList = Lists.newArrayList();
            List<EsLog> esLogList = Lists.newArrayList();
            for (Message message : messages) {
                // json字符串解析成对象
                LogApi apiLog = JSON.parseObject(new String(message.getBody()), LogApi.class);
                if (configuration.getStorageType() == BizConstants.LOG_API_STARAGE_ALL_TYPE || configuration.getStorageType() == BizConstants.LOG_API_STARAGE_DB_TYPE) {
                    LogApiList.add(apiLog);
                }

                if (configuration.getStorageType() == BizConstants.LOG_API_STARAGE_ES_TYPE || configuration.getStorageType() == BizConstants.LOG_API_STARAGE_ALL_TYPE) {
                    EsLog esLog = new EsLog();
                    BeanUtils.copyProperties(apiLog, esLog);
                    esLogList.add(esLog);
                }
            }
            
        } catch (Exception ex) {

            throw ex;
        }
    }
}
```

@Conditional(RabbitConfig.RabbitCondition.class) 是实现动态加载的关键点。