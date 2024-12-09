---
title: 微服务集成dockerfile-maven-plugin插件
categories:
	- Docker
tags: 
	- Docker
	
date: 2024-11-18 17:01:21
updated: 2024-11-18 17:01:34
---
<!-- toc -->
# <span id="inline-blue">环境</span>
    Docker: 26.1.4
	idea: 2018-2-1
	dockerfile-maven-plugin: 1.4.9
# <span id="inline-blue">背景</span>
微服务打包之后希望Docker构建镜像生成容器运行，使用dockerfile-maven-plugin插件实现
# <span id="inline-blue">Docker开放远程连接</span>
修改Docker服务配置文件，增加远程连接端口监听，文件所在位置
vim /lib/systemd/system/docker.service
```shell
[Service]
Type=notify
# the default is not to use systemd for cgroups because the delegate issues still
# exists and systemd currently does not support the cgroup feature set required
# for containers run by docker
ExecStart=/usr/bin/dockerd -H tcp://0.0.0.0:2375  -H fd:// --containerd=/run/containerd/containerd.sock
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutStartSec=0
RestartSec=2
Restart=always
```
-H tcp://0.0.0.0:2375  指定监听所有地址的2375端口连接
# <span id="inline-blue">重启Docker服务</span>
```shell
sudo systemctl daemon-reload
sudo systemctl restart docker.service
```
# <span id="inline-blue">idea配置Docker连接</span>
![Docker远程连接](/images/docker/20241118/Docker_Idea_20241118_001.png)
# <span id="inline-blue">添加maven插件依赖</span>
```xml
<!--控制微服务build阶段生成jar时构建镜像 true:不执行 false:执行-->
<properties>
<dockerfile-maven-plugin.version>1.4.9</dockerfile-maven-plugin.version>
<Dockerfile.skip>true</Dockerfile.skip>
</properties>
<!--   dockerfile-maven-plugin      -->
            <plugin>
                <groupId>com.spotify</groupId>
                <artifactId>dockerfile-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <id>default</id>
                        <goals>
                            <goal>build</goal>
                        </goals>
                    </execution>
                </executions>
                <configuration>
                    <skip>${Dockerfile.skip}</skip>
                    <repository>${project.artifactId}</repository>
                    <tag>${project.version}</tag>
                    <buildArgs>
                        <JAR_FILE>${project.build.finalName}.jar</JAR_FILE>
                    </buildArgs>
                </configuration>
            </plugin> 
```
# <span id="inline-blue">验证</span>
maven clean install 执行后微服务模块自动构建对应镜像
![Docker构建镜像验证](/images/docker/20241118/Docker_Idea_20241118_002.png)