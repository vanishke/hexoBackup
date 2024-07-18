---
title: SpringBoot集成RabbitMQ实现日志批量入库
categories: 
	- SpringBoot
tags: 
	- RabbitMQ
	- SpringBoot
	- SpringCloud
	- Java
	
date: 2024-03-15 16:53:20
updated: 2024-03-15 16:53:20
---
<!-- toc -->

## <span id="inline-blue">环境</span>
SpringCloud : 2021.0.5
SpringBoot : 2.2.6.RELEASE
Spring : 5.2.5.RELEASE
RabbitMQ : 3.8.8
Java : 1.8
## <span id="inline-blue">背景</span>
微服务在压力测试情况下产生大量接口请求日志导致日志记录模块并发过高，MySQL连接占用过高，采用RabbitMQ缓解日志并发写入压力，批量提交写入日志请求到MYSQL。
## <span id="inline-blue">实现</span>
Maven添加RabbitMQ依赖，不需要指定版本，默认是保持和SpringBoot版本一致
```java
<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-amqp</artifactId>
		</dependency>
```

添加RabbitMQ相应配置
```properties

spring.rabbitmq.host=10.9.216.12
spring.rabbitmq.port=5672
spring.rabbitmq.username=admin
spring.rabbitmq.password=admin
# 默认true，代表消费报错会重新回到队列。false则不会回到队列
spring.rabbitmq.listener.simple.default-requeue-rejected=false
# 默认是auto 自动确定是否收到消息，如果消费失败则会一直进入队列消费
# 改为manual手动调用change.basicAck确认
# 改为none 若没收到或者消费成功都不会回到队列
spring.rabbitmq.listener.direct.acknowledge-mode=none
#可以确保消息在未被队列接收时返回
spring.rabbitmq.publisher-returns=true
#发送一个批次中消息的数量,默认100
rabbitmq.batch.size=100
#批量消息的最大大小;如果超过了此值，它会取代batchSize, 并导致要发送的部分批处理,默认4M
rabbitmq.batch.bufferLimit=1048576
#当没有新的活动添加到消息批处理时之后，将发送部分批处理的时间,默认10s
rabbitmq.batch.timeOut=10000
#rabbitMQ支持,true:日志记录通过rabbitMQ进行处理 false: 日志直接写入Elasticsearch或者MYSQL
parameter.rabbitmqSupport=true
#日志存储类型:0(数据库),1(es),2(两者都存)
parameter.storageType=1
#日志存储类型:0(数据库),1(es)
parameter.selectType=1
```

RabbitMQ配置类,定义queue、exchange绑定关系
```Java
package com.ffcs.platform.adminbiz.rabbitmq;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.batch.BatchingStrategy;
import org.springframework.amqp.rabbit.batch.SimpleBatchingStrategy;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.BatchingRabbitTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@RefreshScope
@Configuration
public class RabbitConfig {

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
    @Bean
    public DirectExchange directExchange() {
        return new DirectExchange(EXCHANGE);
    }

    /**
     * 自动创建队列
     */
    @Bean
    public Queue createBatchQueue() {
        return new Queue(QUEUE);
    }


    /**
     *     * 自己将队列绑定到交换机，路由键使用队列名
     */
    @Bean
    public Binding directBinding() {
        return BindingBuilder.bind(createBatchQueue()).to(directExchange()).withQueueName();
    }


    /**
     *  * 使用定时任务线程池，定时从队列中拉取数据
     */
    @Bean("batchQueueTaskScheduler")
    public TaskScheduler batchQueueTaskScheduler() {
        return new ThreadPoolTaskScheduler();
    }

    /**
     *     * 批量处理rabbitTemplate
     * 该策略只支持一个exchange/routingKey
     *  
     */
    @Bean("batchQueueRabbitTemplate")
    public BatchingRabbitTemplate batchQueueRabbitTemplate(ConnectionFactory connectionFactory, @Qualifier("batchQueueTaskScheduler") TaskScheduler taskScheduler) {
        BatchingStrategy batchingStrategy = new SimpleBatchingStrategy(batchSize, bufferLimit, timeOut);
        return new BatchingRabbitTemplate(connectionFactory, batchingStrategy, taskScheduler);
    }

    /**
     *   * 配置监听容器
     */
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

}

```

消息生产者
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
    @Autowired
    private BatchingRabbitTemplate batchQueueRabbitTemplate;

    private String index = "es_log_api_";
	
	@PostMapping({"/log/api"})
    @ApiOperation("保存日志信息")
    public ApiResponse save(@RequestBody  LogApi apiLog) {

        if (configuration.isRabbitmqSupport()) {
            Message message = new Message(JSON.toJSONString(apiLog).getBytes(), new MessageProperties());
            message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
            this.batchQueueRabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.QUEUE, message);
            return success(true);
        } else {
            EsLog esLog = new EsLog();
            BeanUtils.copyProperties(apiLog, esLog);
            if (configuration.getStorageType() == BizConstants.LOG_API_STARAGE_ES_TYPE) {
                //判断索引是否存在
                boolean esResult = insertEs(esLog);
                if (esResult) {
                    return success("日志写入Elasticsearch成功！");
                } else {
                    return fail("日志写入Elasticsearch失败！");
                }
            } else if (configuration.getStorageType() == BizConstants.LOG_API_STARAGE_ALL_TYPE) {
                //插入ES，数据库
                boolean dbResult = apiLogService.save(apiLog);
                boolean esResult = insertEs(esLog);
                if (dbResult && esResult) {
                    return success("日志写入数据库,Elasticsearch成功");
                } else if (!dbResult && esResult) {
                    return fail("日志写入数据库失败!");
                } else if (!esResult && dbResult) {
                    return fail("日志写入Elasticsearch失败!");
                } else {
                    return fail("日志写入数据库、Elasticsearch均失败！");
                }
            } else {
                //插入数据库
                boolean dbResult = apiLogService.save(apiLog);
                if (dbResult) {
                    return success("日志写入数据库成功!");
                } else {
                    return fail("日志写入数据库失败!");
                }
            }
        }
    }
}
```

消息消费者
```Java
package com.ffcs.platform.adminbiz.rabbitmq;

import co.elastic.clients.elasticsearch._types.mapping.DateProperty;
import co.elastic.clients.elasticsearch._types.mapping.IntegerNumberProperty;
import co.elastic.clients.elasticsearch._types.mapping.LongNumberProperty;
import co.elastic.clients.elasticsearch._types.mapping.Property;
import co.elastic.clients.elasticsearch._types.mapping.TextProperty;
import com.alibaba.fastjson.JSON;
import com.ffcs.platform.adminapi.entity.log.LogApi;
import com.ffcs.platform.adminbiz.bean.EsLog;
import com.ffcs.platform.adminbiz.config.ElasticSearchConfiguration;
import com.ffcs.platform.adminbiz.service.elasticsearch.DocumentService;
import com.ffcs.platform.adminbiz.service.log.LogApiService;
import com.ffcs.platform.common.base.constants.BizConstants;
import com.ffcs.platform.common.config.redis.RedisUtils;
import com.google.common.collect.Lists;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.client.utils.DateUtils;
import org.springframework.amqp.core.BatchMessageListener;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Slf4j
@Component
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
            if (configuration.getStorageType() == BizConstants.LOG_API_STARAGE_ES_TYPE) {
                //判断索引是否存在
                boolean esResult = bulkInsertEs(esLogList);
                if (esResult) {
                    log.info("日志写入Elasticsearch成功!");
                } else {
                    log.error("日志写入Elasticsearch失败!");
                }
            } else if (configuration.getStorageType() == BizConstants.LOG_API_STARAGE_ALL_TYPE) {
                //插入ES，数据库
                int dbResult = apiLogService.saveBatchList(LogApiList);
                boolean esResult = bulkInsertEs(esLogList);
                if (dbResult > 0 && esResult) {
                    log.info("日志写入数据库成功!");
                    log.info("日志写入Elasticsearch成功!");
                } else if (!(dbResult > 0) && esResult) {
                    log.error("日志写入数据库失败!");
                } else if (!esResult && (dbResult > 0)) {
                    log.error("日志写入Elasticsearch失败!");
                } else {
                    log.error("日志写入数据库、Elasticsearch均失败!");
                }
            } else {
                //插入数据库
                int dbResult = apiLogService.saveBatchList(LogApiList);
                if (dbResult > 0) {
                    log.info("日志写入数据库成功!");
                } else {
                    log.error("日志写入数据库失败!");
                }
            }
        } catch (Exception ex) {

            throw ex;
        }
    }

    public boolean bulkInsertEs(List<EsLog> dataList) {
        String strDate = DateUtils.formatDate(new Date(), "yyyy-MM-dd");
        String indexName = index + strDate;
        boolean hasIndex = documentService.hasIndex(indexName);
        if (!hasIndex) {
            //设置key防止并发
            redisUtils.set("indexHistory", indexName, 0);
            if (redisUtils.hasKey("indexHistory")) {

                Map<String, Property> mapping = new HashMap<>();
                mapping.put("id", new Property(new LongNumberProperty.Builder().index(true).build()));
                mapping.put("url", new Property(new TextProperty.Builder().index(true).build()));
                mapping.put("method", new Property(new TextProperty.Builder().index(true).build()));
                mapping.put("params", new Property(new TextProperty.Builder().index(true).build()));
                mapping.put("createTime", new Property(new DateProperty.Builder().index(true).format("yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis").build()));
                mapping.put("times", new Property(new LongNumberProperty.Builder().index(true).build()));
                mapping.put("creator", new Property(new TextProperty.Builder().index(true).build()));
                mapping.put("ip", new Property(new TextProperty.Builder().index(false).build()));
                mapping.put("address", new Property(new TextProperty.Builder().index(false).build()));
                mapping.put("description", new Property(new TextProperty.Builder().index(true).build()));
                mapping.put("status", new Property(new IntegerNumberProperty.Builder().index(false).build()));
                mapping.put("errorLog", new Property(new TextProperty.Builder().index(false).build()));
                mapping.put("createTimeStr", new Property(new TextProperty.Builder().index(false).build()));

                documentService.createIndexMap(indexName, mapping);
                redisUtils.delete("indexHistory");
            }
        }
        boolean flag = documentService.bulkInsertDocument(indexName, dataList);
        return flag;
    }

}

```

## <span id="inline-blue">验证</span>
![RabbitMQ记录日志](/images/RabbitMQ/RabbitMQ_20240315_001.png)




