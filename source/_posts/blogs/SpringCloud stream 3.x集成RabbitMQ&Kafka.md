---
title: SpringCloud stream 3.x集成RabbitMQ&Kafka
categories:
	- SpringCloud Stream
tags: 
	- SpringCloud Stream
	
date: 2025-05-09 17:15:09
updated: 2025-05-09 17:15:09
---
<!-- toc -->
# <span id="inline-blue">环境</span>

SpringBoot: 2.6.6
SpringCloud: 2021.0.6
SpringCloud stream: 3.2.6
jdk: 1.8

# <span id="inline-blue">实现</span>

同时加载spring-cloud-stream-binder-kafka和spring-cloud-stream-binder-rabbit依赖

```xml

 <?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<!--spring-boot必须是2.x-->
		<version>2.6.6</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.waylau.spring.cloud.stream.batch.demo</groupId>
	<artifactId>spring-cloud-stream-batch-demo</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>spring-cloud-stream-batch-demo</name>
	<description>Batch demo for Spring Cloud Stream</description>
	<properties>
		<java.version>1.8</java.version>
		<!--spring-cloud必须是2021.x-->
		<spring-cloud.version>2021.0.5</spring-cloud.version>
		<spring-integration.version>5.5.9</spring-integration.version>
		<spring-cloud-stream-binder-jms.version>1.0.0.RELEASE</spring-cloud-stream-binder-jms.version>
		<spring-cloud-starter-stream-rocketmq.version>2022.0.0.0-RC1</spring-cloud-starter-stream-rocketmq.version>
	</properties>
	<dependencies>

		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-stream</artifactId>
		</dependency>

		<!--start: 添加binder -->
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-stream-binder-kafka</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.cloud</groupId>
			<artifactId>spring-cloud-stream-binder-rabbit</artifactId>
		</dependency>
		        <!--
        spring integration start
        解决spring-cloud-stream集成kafka依赖spring-integration-5.5.10,初始化加载使用java9版本List.of()操作导致异常
        spring-integration版本降为5.5.9版本
        -->
		<dependency>
			<groupId>org.springframework.integration</groupId>
			<artifactId>spring-integration-jmx</artifactId>
			<version>${spring-integration.version}</version>
		</dependency>
		<dependency>
			<groupId>org.springframework.integration</groupId>
			<artifactId>spring-integration-core</artifactId>
			<version>${spring-integration.version}</version>
		</dependency>
		<dependency>
			<groupId>org.springframework.integration</groupId>
			<artifactId>spring-integration-kafka</artifactId>
			<version>${spring-integration.version}</version>
		</dependency>
		<dependency>
			<groupId>org.springframework.integration</groupId>
			<artifactId>spring-integration-amqp</artifactId>
			<version>${spring-integration.version}</version>
		</dependency>
		<!--
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-activemq</artifactId>
		</dependency>
        -->
		<!--
		<dependency>
			<groupId>com.alibaba.cloud</groupId>
			<artifactId>spring-cloud-starter-stream-rocketmq</artifactId>
			<version>${spring-cloud-starter-stream-rocketmq.version}</version>
		</dependency>

		<dependency>
			<groupId>com.boutouil</groupId>
			<artifactId>spring-cloud-stream-binder-jms</artifactId>
			<version>${spring-cloud-stream-binder-jms.version}</version>
		</dependency>
		-->
		<!--end: 添加binder-->

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>

	</dependencies>
	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>org.springframework.cloud</groupId>
				<artifactId>spring-cloud-dependencies</artifactId>
				<version>${spring-cloud.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
	</dependencyManagement>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>


```

代码实现：

```java
package com.waylau.spring.cloud.stream.batch.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;
import java.util.List;
import java.util.function.Consumer;

/**
 * 批量消费与生产
 *
 * @author <a href="https://waylau.com">Way Lau</a>
 * @since 2023-02-22
 */
@SpringBootApplication
public class DemoApplication {
    private final static List<Person> PERSON_LIST = Arrays.asList(
            new Person("Sam Spade"),
            new Person("Sam Po"),
            new Person("Sam Li"),
            new Person("Sam Bo"),
            new Person("Way Lau"),
            new Person("Fei Po"),
            new Person("Gu Li")
    );

    @Autowired
    private StreamBridge bridge;

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Bean
    public ApplicationRunner runner() {
        return arg -> {
            // 将消息批量转发到其他destination
            //bridge.send("logBatchTransmitDestination", PERSON_LIST);

            // 将消息逐个转发到其他destination
            PERSON_LIST.stream().forEach(person -> {
                System.out.println("Sending: " + person);
                bridge.send("api-log-topic", person);
            });
        };

    }

    /**
     * 批量消息处理器
     *
     * @return
     */
    @Bean
    public Consumer<List<Person>> apiLogConsumer() {
        return personList -> {
            // 打印出接收到的消息
            System.out.println("Received personList: " + personList);
        };
    }

    public static class Person {
        private String name;

        public Person() {

        }

        public Person(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String toString() {
            return this.name;
        }
    }
}
```

application.yml配置文件内容：

```yml
spring:
#  rabbitmq:
#    host: 10.9.216.12
#    port: 5672
#    username: admin
#    password: admin
  kafka:
    bootstrap-servers: 10.9.216.12:9092
  cloud:
    function:
      definition: apiLogConsumer
    stream:
      defaultBinder: kafka
      bindings:
        apiLogConsumer-in-0:
          destination: api-log-topic
          group: api-log-group
          consumer:
            batch-mode: true
            max-attempts: 3 # 尝试消费该消息的最大次数（消息消费失败后，发布者会重新投递）。默认3
            back-off-initial-interval: 1000 # 重试消费消息的初始化间隔时间。默认1s，即第一次重试消费会在1s后进行
            back-off-multiplier: 2 # 相邻两次重试之间的间隔时间的倍数。默认2
            back-off-max-interval: 10000 #下一次尝试重试的最大时间间隔，默认为10000ms，即10s
#      rabbit:
#        bindings:
#          apiLogConsumer-in-0:
#            consumer:
#              batch-size: 10
#              enable-batching: true
#              receive-timeout: 2000
#              auto-bind-dlq: true
#              dead-letter-exchange: api-log-topic-dlx
#              republish-to-dlq: true
#              prefetch: 1
#              max-concurrency: 1
#              acknowledge-mode:  AUTO

      kafka:
        binder:
          brokers: ${spring.kafka.bootstrap-servers}
          default-topic: api-log-topic
          auto-create-topics: true
          auto-add-partitions: true
          consumer:
            max-poll-records: 10
            fetch-min-bytes: 20480
            fetch-max-wait: 2000

```
