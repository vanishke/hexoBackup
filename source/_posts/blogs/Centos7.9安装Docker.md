---
title: CentOS7.9安装Docker
categories:
	- Docker
tags: 
	- Docker
	- Linux
	- CentOS
	
date: 2026-02-04 15:29:03
updated: 2026-02-04 15:29:03
---
<!-- toc -->

# <span id="inline-blue">环境</span>

- CentOS Linux release 7.9.2009 (Core)

# <span id="inline-blue">配置docker-ce yum源</span>

```shell
sudo wget -O /etc/yum.repos.d/docker-ce.repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

# <span id="inline-blue">安装Docker</span>

```shell
sudo yum -y install docker-ce
```

# <span id="inline-blue">依赖报错（container-selinux / slirp4netns / fuse-overlayfs）</span>

安装过程中可能遇到依赖缺失，报错示例如下（节选）：

```text
[root@master kubernete]#y yum -y install docker-ce                           
Resolving Dependencies
--> Running transaction check
---> Package docker-ce.x86_64 3:26.1.4-1.el7 will be installed
--> Processing Dependency: container-selinux >= 2:2.74 for package: 3:docker-ce-26.1.4-1.el7.x86_64
--> Processing Dependency: containerd.io >= 1.6.24 for package: 3:docker-ce-26.1.4-1.el7.x86_64
--> Processing Dependency: libseccomp >= 2.3 for package: 3:docker-ce-26.1.4-1.el7.x86_64
--> Processing Dependency: docker-ce-cli for package: 3:docker-ce-26.1.4-1.el7.x86_64
--> Processing Dependency: docker-ce-rootless-extras for package: 3:docker-ce-26.1.4-1.el7.x86_64
--> Processing Dependency: libcgroup for package: 3:docker-ce-26.1.4-1.el7.x86_64
--> Running transaction check
---> Package containerd.io.x86_64 0:1.6.33-3.1.el7 will be installed
--> Processing Dependency: container-selinux >= 2:2.74 for package: containerd.io-1.6.33-3.1.el7.x86_64
---> Package docker-ce.x86_64 3:26.1.4-1.el7 will be installed
--> Processing Dependency: container-selinux >= 2:2.74 for package: 3:docker-ce-26.1.4-1.el7.x86_64
---> Package docker-ce-cli.x86_64 1:26.1.4-1.el7 will be installed
--> Processing Dependency: docker-buildx-plugin for package: 1:docker-ce-cli-26.1.4-1.el7.x86_64
--> Processing Dependency: docker-compose-plugin for package: 1:docker-ce-cli-26.1.4-1.el7.x86_64
---> Package docker-ce-rootless-extras.x86_64 0:26.1.4-1.el7 will be installed
--> Processing Dependency: fuse-overlayfs >= 0.7 for package: docker-ce-rootless-extras-26.1.4-1.el7.x86_64
--> Processing Dependency: slirp4netns >= 0.4 for package: docker-ce-rootless-extras-26.1.4-1.el7.x86_64
---> Package libcgroup.x86_64 0:0.41-21.el7 will be installed
---> Package libseccomp.x86_64 0:2.3.1-4.el7 will be installed
--> Running transaction check
---> Package containerd.io.x86_64 0:1.6.33-3.1.el7 will be installed
--> Processing Dependency: container-selinux >= 2:2.74 for package: containerd.io-1.6.33-3.1.el7.x86_64
---> Package docker-buildx-plugin.x86_64 0:0.14.1-1.el7 will be installed
---> Package docker-ce.x86_64 3:26.1.4-1.el7 will be installed
--> Processing Dependency: container-selinux >= 2:2.74 for package: 3:docker-ce-26.1.4-1.el7.x86_64
---> Package docker-ce-rootless-extras.x86_64 0:26.1.4-1.el7 will be installed
--> Processing Dependency: fuse-overlayfs >= 0.7 for package: docker-ce-rootless-extras-26.1.4-1.el7.x86_64
--> Processing Dependency: slirp4netns >= 0.4 for package: docker-ce-rootless-extras-26.1.4-1.el7.x86_64
---> Package docker-compose-plugin.x86_64 0:2.27.1-1.el7 will be installed
--> Finished Dependency Resolution
Error: Package: containerd.io-1.6.33-3.1.el7.x86_64 (docker-ce-stable)
           Requires: container-selinux >= 2:2.74
Error: Package: docker-ce-rootless-extras-26.1.4-1.el7.x86_64 (docker-ce-stable)
           Requires: slirp4netns >= 0.4
Error: Package: 3:docker-ce-26.1.4-1.el7.x86_64 (docker-ce-stable)
           Requires: container-selinux >= 2:2.74
Error: Package: docker-ce-rootless-extras-26.1.4-1.el7.x86_64 (docker-ce-stable)
           Requires: fuse-overlayfs >= 0.7
 You could try using --skip-broken to work around the problem
 You could try running: rpm -Va --nofiles --nodigest
```

其中 `slirp4netns`、`fuse-overlayfs`、`container-selinux` 等依赖在部分离线/受限环境中无法通过 yum 直接拉取到满足版本要求的包，需要改用**离线方式**补齐依赖。

# <span id="inline-blue">离线安装依赖包清单</span>

离线安装时，除 `slirp4netns`、`fuse-overlayfs` 自身外，往往还需要额外依赖。以下为一组可用的依赖 RPM（示例清单）：

```text
conntrack-tools-1.4.4-11.el8.x86_64.rpm
conntrack-tools-1.4.8-1-omv2490.x86_64.rpm
container-selinux-2.107-3.el7.noarch.rpm
fuse3-3.6.1-4.el7.x86_64.rpm
fuse3-devel-3.6.1-4.el7.x86_64.rpm
fuse3-libs-3.6.1-4.el7.x86_64.rpm
fuse-overlayfs-0.7.2-6.el7_8.x86_64.rpm
libnetfilter_conntrack-1.0.6-1.el7_3.x86_64.rpm
libnetfilter_cthelper-1.0.0-11.el7.x86_64.rpm
libnetfilter_cttimeout-1.0.0-7.el7.x86_64.rpm
libnetfilter_cttimeout-devel-1.0.0-7.el7.x86_64.rpm
libnetfilter_queue-1.0.2-2.el7_2.x86_64.rpm
slirp4netns-0.4.2-3.git21fdece.module+el8.5.0+770+e2f49861.x86_64.rpm
```

> 建议将所有 rpm 放在同一目录（例如 `/usr/local/docker-rpms`），然后按依赖关系顺序执行安装。

# <span id="inline-blue">离线安装（按依赖顺序rpm -ivh）</span>

进入 RPM 所在目录后，按依赖关系顺序安装（示例命令如下，实际请以你手头 rpm 文件名为准）：

```shell
# 1) netfilter 相关依赖
rpm -ivh libnetfilter_queue-1.0.2-2.el7_2.x86_64.rpm
rpm -ivh libnetfilter_cthelper-1.0.0-11.el7.x86_64.rpm
rpm -ivh libnetfilter_cttimeout-1.0.0-7.el7.x86_64.rpm
rpm -ivh libnetfilter_cttimeout-devel-1.0.0-7.el7.x86_64.rpm
rpm -ivh libnetfilter_conntrack-1.0.6-1.el7_3.x86_64.rpm

# 2) conntrack-tools（根据实际包选择其一版本安装）
rpm -ivh conntrack-tools-1.4.4-11.el8.x86_64.rpm
# 或
# rpm -ivh conntrack-tools-1.4.8-1-omv2490.x86_64.rpm

# 3) container-selinux
rpm -ivh container-selinux-2.107-3.el7.noarch.rpm

# 4) fuse3 相关
rpm -ivh fuse3-libs-3.6.1-4.el7.x86_64.rpm
rpm -ivh fuse3-3.6.1-4.el7.x86_64.rpm
rpm -ivh fuse3-devel-3.6.1-4.el7.x86_64.rpm

# 5) fuse-overlayfs / slirp4netns
rpm -ivh fuse-overlayfs-0.7.2-6.el7_8.x86_64.rpm
rpm -ivh slirp4netns-0.4.2-3.git21fdece.module+el8.5.0+770+e2f49861.x86_64.rpm
```

完成离线依赖安装后，再重新执行 Docker 安装：

```shell
sudo yum -y install docker-ce
```

# <span id="inline-blue">container-selinux下载地址</span>

`container-selinux` 可在以下地址下载（按需要选择版本）：

- `https://linuxsoft.cern.ch/cern/centos/7/extras/x86_64/repoview/container-selinux.html`

同时，CentOS 7.9 extras 仓库 RPM（用于补齐部分依赖）可参考：

- `https://mirrors.aliyun.com/centos/7.9.2009/extras/x86_64/Packages/?spm=a2c6h.25603864.0.0.408b4febKjLSqn`

已整理的一组离线依赖包（百度云）：

- 链接：`https://pan.baidu.com/s/1p0WWIbXqqlW73aNcSfxHhA?pwd=1g5u`
- 提取码：`1g5u`

# <span id="inline-blue">安装container-selinux提示policycoreutils-python缺失</span>

安装 `container-selinux-2.107-3.el7.noarch.rpm` 时可能提示：

```text
error: Failed dependencies:
        policycoreutils-python is needed by container-selinux-2:2.107-3.el7.noarch
```

可通过 yum 安装 `policycoreutils-python`。如果服务器 yum 源不可用，可先切到阿里云源（示例）：

```shell
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

yum clean all
yum makecache
```

然后安装依赖：

```shell
yum install -y policycoreutils-python
```

# <span id="inline-blue">启动并设置开机自启</span>

```shell
systemctl start docker
systemctl enable docker
```

