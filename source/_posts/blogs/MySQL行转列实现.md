---
title: MySQL行转列实现
categories:
	- MySQL
tags: 
	- MySQL
	
date: 2023-01-09 16:24:20
updated: 2023-01-09 16:24:20
---
<!-- toc -->

# <span id="inline-blue">要求</span>
原始表数据：

![原表](/images/mysql/mysql_20230109_001.png)
新表数据：
![新表](/images/mysql/mysql_20230109_002.png)
将父级区域对应的子区域集合合并展现
# <span id="inline-blue">实现</span>
通过group_concat函数实现行转列
原始表结构
```sql
/*
 Navicat Premium Data Transfer

 Source Server         : 10.9.216.12
 Source Server Type    : MySQL
 Source Server Version : 50560
 Source Host           : 10.9.216.12:3306
 Source Schema         : nanjing_iepg_xw

 Target Server Type    : MySQL
 Target Server Version : 50560
 File Encoding         : 65001

 Date: 09/01/2023 16:39:42
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for area
-- ----------------------------
DROP TABLE IF EXISTS `area`;
CREATE TABLE `area`  (
  `id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `areaCode` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `areaName` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `parentId` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `remark` varchar(256) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of area
-- ----------------------------
INSERT INTO `area` VALUES ('1048', '025', '南京市', '-1', '南京各地市布局');
INSERT INTO `area` VALUES ('1050', '1502', '江宁', '1048', '江宁布局');
INSERT INTO `area` VALUES ('1051', '1503', '六合', '1048', '');
INSERT INTO `area` VALUES ('1052', '1504', '浦口', '1048', '');
INSERT INTO `area` VALUES ('1053', '1505', '雨花', '1048', '');
INSERT INTO `area` VALUES ('1054', '1506', '高淳', '1048', '');
INSERT INTO `area` VALUES ('1056', '1509', '溧水', '1048', '');
INSERT INTO `area` VALUES ('1057', '0516', '徐州市', '-1', '徐州各地市布局');
INSERT INTO `area` VALUES ('1058', '3202', '徐州市', '1057', '');
INSERT INTO `area` VALUES ('1059', '0518', '连云港市', '-1', '连云港各地市布局');
INSERT INTO `area` VALUES ('1060', '3209', '东海', '1059', '');
INSERT INTO `area` VALUES ('1061', '3212', '赣榆', '1059', '');
INSERT INTO `area` VALUES ('1062', '3025', '灌南', '1059', '');
INSERT INTO `area` VALUES ('1063', '3023', '灌云', '1059', '');
INSERT INTO `area` VALUES ('1064', '3201', '连云港市', '1059', '');
INSERT INTO `area` VALUES ('1065', '0513', '南通市', '-1', '南通各地市布局');
INSERT INTO `area` VALUES ('1066', '3310', '如东', '1065', '');
INSERT INTO `area` VALUES ('1067', '3305', '通州', '1065', '');
INSERT INTO `area` VALUES ('1068', '3308', '启东', '1065', '');
INSERT INTO `area` VALUES ('1069', '3307', '海门', '1065', '');
INSERT INTO `area` VALUES ('1070', '3301', '南通市', '1065', '');
INSERT INTO `area` VALUES ('1071', '0515', '盐城市', '-1', '盐城各地市布局');
INSERT INTO `area` VALUES ('1072', '3022', '阜宁', '1071', '');
INSERT INTO `area` VALUES ('1073', '3096', '射阳', '1071', '');
INSERT INTO `area` VALUES ('1074', '3054', '滨海', '1071', '');
INSERT INTO `area` VALUES ('1075', '3053', '建湖', '1071', '');
INSERT INTO `area` VALUES ('1076', '3061', '大丰', '1071', '');
INSERT INTO `area` VALUES ('1077', '3052', '东台', '1071', '');
INSERT INTO `area` VALUES ('1078', '3055', '响水', '1071', '');
INSERT INTO `area` VALUES ('1079', '3051', '盐城市', '1071', '');
INSERT INTO `area` VALUES ('1080', '0519', '常州市', '-1', '常州各地市布局');
INSERT INTO `area` VALUES ('1081', '3316', '金坛', '1080', '');
INSERT INTO `area` VALUES ('1082', '3065', '溧阳', '1080', '');
INSERT INTO `area` VALUES ('1084', '3032', '常州市', '1080', '');
INSERT INTO `area` VALUES ('1085', '0000', '默认布局', '-1', '');
INSERT INTO `area` VALUES ('1086', '3204', '丰县', '1057', '');
INSERT INTO `area` VALUES ('1087', '3095', '贾汪', '1057', '');
INSERT INTO `area` VALUES ('1088', '3203', '新沂', '1057', '');
INSERT INTO `area` VALUES ('1089', '3024', '铜山', '1057', '');
INSERT INTO `area` VALUES ('1090', '3210', '邳州', '1057', '');
INSERT INTO `area` VALUES ('1091', '3211', '睢宁', '1057', '');
INSERT INTO `area` VALUES ('1092', '3213', '沛县', '1057', '');
INSERT INTO `area` VALUES ('1093', '0527', '宿迁市', '-1', '宿迁各地市布局');
INSERT INTO `area` VALUES ('1094', '3103', '泗阳', '1093', '');
INSERT INTO `area` VALUES ('1095', '3102', '泗洪', '1093', '');
INSERT INTO `area` VALUES ('1096', '3064', '沭阳', '1093', '');
INSERT INTO `area` VALUES ('1097', '3101', '宿迁市', '1093', '');
INSERT INTO `area` VALUES ('1098', '0514', '扬州市', '-1', '扬州各地市布局');
INSERT INTO `area` VALUES ('1099', '3205', '仪征', '1098', '');
INSERT INTO `area` VALUES ('1100', '3206', '江都', '1098', '');
INSERT INTO `area` VALUES ('1101', '3207', '高邮', '1098', '');
INSERT INTO `area` VALUES ('1102', '3208', '宝应', '1098', '');
INSERT INTO `area` VALUES ('1103', '0517', '淮安市', '-1', '淮安市各区县布局');
INSERT INTO `area` VALUES ('1104', '3020', '涟水', '1103', '');
INSERT INTO `area` VALUES ('1105', '3021', '淮安区', '1103', '');
INSERT INTO `area` VALUES ('1106', '3031', '淮安市', '1103', '');
INSERT INTO `area` VALUES ('1107', '3036', '淮阴', '1103', '');
INSERT INTO `area` VALUES ('1108', '3037', '洪泽', '1103', '');
INSERT INTO `area` VALUES ('1109', '3038', '金湖', '1103', '');
INSERT INTO `area` VALUES ('1110', '3063', '盱眙', '1103', '');
INSERT INTO `area` VALUES ('1111', '0511', '镇江市', '-1', '镇江市各区县布局');
INSERT INTO `area` VALUES ('1112', '3001', '镇江市', '1111', '');
INSERT INTO `area` VALUES ('1113', '3004', '扬中', '1111', '');
INSERT INTO `area` VALUES ('1114', '3006', '句容', '1111', '');
INSERT INTO `area` VALUES ('1116', '3011', '丹徒', '1111', '');
INSERT INTO `area` VALUES ('1117', '0523', '泰州市', '-1', '泰州市');
INSERT INTO `area` VALUES ('1118', '3002', '泰州市', '1117', '泰州分公司');
INSERT INTO `area` VALUES ('1119', '3005', '兴化', '1117', '泰州兴化广电');
INSERT INTO `area` VALUES ('1120', '3035', '泰兴', '1117', '泰州泰兴广电');
INSERT INTO `area` VALUES ('1121', '3034', '靖江', '1117', '泰州靖江广电');
INSERT INTO `area` VALUES ('1122', '3033', '姜堰', '1117', '泰州姜堰广电');
INSERT INTO `area` VALUES ('1123', '3317', '武进', '1080', '');
INSERT INTO `area` VALUES ('1124', '3056', '盐都', '1071', '');
INSERT INTO `area` VALUES ('1127', '3329', '扬州市', '1098', '');
INSERT INTO `area` VALUES ('1128', '1510', '栖霞', '1048', '南京市-栖霞区');
INSERT INTO `area` VALUES ('1129', '0555', '马鞍山市', '-1', '');
INSERT INTO `area` VALUES ('1130', '3302', '马鞍山市', '1129', '');
INSERT INTO `area` VALUES ('1131', '3113', '丹阳', '1111', '最新修改的区域码');
INSERT INTO `area` VALUES ('1133', '0666', '测试布局-单引擎', '1129', '');
INSERT INTO `area` VALUES ('1134', '0777', '测试布局-双引擎', '1129', '');
INSERT INTO `area` VALUES ('1135', '0510', '无锡市', '-1', '');
INSERT INTO `area` VALUES ('1136', '199000000001', '用直镇', '1135', '');
INSERT INTO `area` VALUES ('1137', '100000000012', '智慧会龙', '1113', '');
INSERT INTO `area` VALUES ('1142', '3304', '海安', '1065', '');
INSERT INTO `area` VALUES ('1143', '1002', '南京', '1048', '');
INSERT INTO `area` VALUES ('1144', '100000000236', '江苏有线南京分公司镇名测试', '1143', '南京一镇一屏测试');
INSERT INTO `area` VALUES ('1147', '100000000296', '江苏省公安厅视频会议', '1143', '');
INSERT INTO `area` VALUES ('1148', '100000000317', '雪堰镇', '1123', '');
INSERT INTO `area` VALUES ('1149', '100000000318', '前黄镇', '1123', '');
INSERT INTO `area` VALUES ('1150', '100000000319', '礼嘉镇', '1123', '');
INSERT INTO `area` VALUES ('1151', '100000000320', '南夏墅街道', '1123', '');
INSERT INTO `area` VALUES ('1152', '100000000321', '湖塘镇', '1123', '');
INSERT INTO `area` VALUES ('1153', '100000000322', '牛塘镇', '1123', '');
INSERT INTO `area` VALUES ('1154', '100000000323', '洛阳镇', '1123', '');
INSERT INTO `area` VALUES ('1155', '100000000324', '横林镇', '1123', '');
INSERT INTO `area` VALUES ('1156', '100000000325', '遥观镇', '1123', '');
INSERT INTO `area` VALUES ('1157', '100000000326', '横山桥镇', '1123', '');
INSERT INTO `area` VALUES ('1158', '100000000327', '郑陆镇', '1123', '');
INSERT INTO `area` VALUES ('1159', '100000000328', '奔牛镇', '1123', '');
INSERT INTO `area` VALUES ('1160', '100000000329', '邹区镇', '1123', '');
INSERT INTO `area` VALUES ('1161', '100000000330', '嘉泽镇', '1123', '');
INSERT INTO `area` VALUES ('1162', '100000000331', '湟里镇', '1123', '');
INSERT INTO `area` VALUES ('1163', '100000000332', '西湖街道', '1123', '');
INSERT INTO `area` VALUES ('1164', '200000000571', '邗江区西湖镇', '1127', '');
INSERT INTO `area` VALUES ('1165', '200000000570', '邗江区杨寿镇', '1127', '');
INSERT INTO `area` VALUES ('1166', '200000000572', '邗江区沙头镇', '1127', '');
INSERT INTO `area` VALUES ('1167', '3062', '如皋', '1065', '');
INSERT INTO `area` VALUES ('1169', '100000000336', '溧水本地', '1056', '溧水一镇一屏');
INSERT INTO `area` VALUES ('1170', '100000000356', '高淳本地', '1054', '');
INSERT INTO `area` VALUES ('1173', '100000000376', '溧水石湫镇一镇一屏', '1056', '');
INSERT INTO `area` VALUES ('1174', '100000000380', '溧水晶桥镇一镇一屏', '1056', '');
INSERT INTO `area` VALUES ('1175', '100000000381', '溧水柘塘镇一镇一屏', '1056', '');
INSERT INTO `area` VALUES ('1176', '100000000378', '溧水白马镇一镇一屏', '1056', '');
INSERT INTO `area` VALUES ('1177', '100000000382', '溧水东屏镇一镇一屏', '1056', '');
INSERT INTO `area` VALUES ('1178', '100000000377', '溧水洪蓝镇一镇一屏', '1056', '');
INSERT INTO `area` VALUES ('1179', '100000000379', '溧水和凤镇一镇一屏', '1056', '');
INSERT INTO `area` VALUES ('1180', '00010', '多屏同看测试组', '1143', '');
INSERT INTO `area` VALUES ('1181', '1000000002777', '邳州铁富', '1090', '');
INSERT INTO `area` VALUES ('1182', '100000000396', '石湖乡石湖村', '1060', '');
INSERT INTO `area` VALUES ('1183', '100000000422', '大彭镇', '1089', '');
INSERT INTO `area` VALUES ('1184', '100000000420', '柳新镇', '1089', '');
INSERT INTO `area` VALUES ('1185', '200000000860', '邗江区瓜洲镇', '1127', '');
INSERT INTO `area` VALUES ('1186', '100000000432', '柳泉镇', '1089', '');
INSERT INTO `area` VALUES ('1188', '15111', '12', '1050', '');
INSERT INTO `area` VALUES ('1189', '100000000520', '石湖乡团池村', '1060', '');
INSERT INTO `area` VALUES ('1190', '100000000524', '石湖乡廖塘村', '1060', '');
INSERT INTO `area` VALUES ('1191', '100000000523', '石湖乡池庄村', '1060', '');
INSERT INTO `area` VALUES ('1192', '100000000522', '石湖乡乔团村', '1060', '');
INSERT INTO `area` VALUES ('1193', '100000000521', '石湖乡尤庄村', '1060', '');
INSERT INTO `area` VALUES ('1194', '100000000525', '石湖乡驻地', '1060', '');
INSERT INTO `area` VALUES ('1195', '100000000518', '石湖乡水库村', '1060', '');
INSERT INTO `area` VALUES ('1196', '100000000516', '石湖乡大娄村', '1060', '');
INSERT INTO `area` VALUES ('1197', '100000000476', '石湖乡尤塘村', '1060', '');
INSERT INTO `area` VALUES ('1198', '100000000517', '石湖乡黄塘村', '1060', '');
INSERT INTO `area` VALUES ('1199', '100000000519', '石湖乡贺庄村', '1060', '');
INSERT INTO `area` VALUES ('1200', '100000000616', '宿迁龙河镇', '1097', '宿迁龙河镇');
INSERT INTO `area` VALUES ('1201', '200000765252', '宿迁龙河镇1', '1097', '');
INSERT INTO `area` VALUES ('1202', '200000775202', '宿迁新庄', '1097', '');
INSERT INTO `area` VALUES ('1203', '200000000063', '大仪镇', '1099', '');
INSERT INTO `area` VALUES ('1204', '200000000069', '十二圩镇', '1099', '');
INSERT INTO `area` VALUES ('1206', '200000000900', '广陵区李典镇', '1127', '');
INSERT INTO `area` VALUES ('1207', '200000000920', '邗江区甘泉街道', '1127', '');
INSERT INTO `area` VALUES ('1208', '200000000940', '甘泉街道双塘村', '1127', '');
INSERT INTO `area` VALUES ('1209', '200000782202', '宝应射阳湖', '1102', '');
INSERT INTO `area` VALUES ('1210', '200000784202', '山左口乡北古寨村', '1060', '');
INSERT INTO `area` VALUES ('1213', '200000787202', '新安街道', '1088', '');
INSERT INTO `area` VALUES ('1214', '200000762204', 'zyh603', '1143', '流化测试');
INSERT INTO `area` VALUES ('1215', '200000789208', '草桥', '1088', '');
INSERT INTO `area` VALUES ('1216', '200000788203', '高场', '1215', '');
INSERT INTO `area` VALUES ('1217', '200000787203', '钟吾街道', '1088', '');
INSERT INTO `area` VALUES ('1218', '200000789202', '北沟街道', '1088', '');
INSERT INTO `area` VALUES ('1219', '200000789203', '墨河街道', '1088', '');
INSERT INTO `area` VALUES ('1220', '200000789204', '唐店街道', '1088', '');
INSERT INTO `area` VALUES ('1221', '200000789205', '瓦窑镇', '1088', '');
INSERT INTO `area` VALUES ('1222', '200000789206', '港头镇', '1088', '');
INSERT INTO `area` VALUES ('1223', '200000789207', '合沟镇', '1088', '');
INSERT INTO `area` VALUES ('1224', '200000789209', '窑湾镇', '1088', '');
INSERT INTO `area` VALUES ('1225', '200000789210', '棋盘镇', '1088', '');
INSERT INTO `area` VALUES ('1226', '200000789211', '马陵山镇', '1088', '');
INSERT INTO `area` VALUES ('1227', '200000789212', '新店镇', '1088', '');
INSERT INTO `area` VALUES ('1228', '200000789213', '邵店镇', '1088', '');
INSERT INTO `area` VALUES ('1229', '200000789214', '时集镇', '1088', '');
INSERT INTO `area` VALUES ('1230', '200000789215', '高流镇', '1088', '');
INSERT INTO `area` VALUES ('1231', '200000789216', '阿湖镇', '1088', '');
INSERT INTO `area` VALUES ('1232', '200000789217', '双塘镇', '1088', '');
INSERT INTO `area` VALUES ('1233', '200000788202', '人民医院', '1088', '');
INSERT INTO `area` VALUES ('1235', '200000793202', '西岗街道', '1128', '');
INSERT INTO `area` VALUES ('1236', '200000793203', '八卦洲街道', '1128', '');
INSERT INTO `area` VALUES ('1237', '200000795202', '临河镇', '1094', '');
INSERT INTO `area` VALUES ('1238', '200000800202', '桠溪镇', '1054', '');
INSERT INTO `area` VALUES ('1239', '200000800203', '漆桥镇', '1054', '');
INSERT INTO `area` VALUES ('1240', '200000800204', '砖墙镇', '1054', '');
INSERT INTO `area` VALUES ('1241', '200000802202', '横溪街道', '1050', '');
INSERT INTO `area` VALUES ('1242', '200000802203', '秣陵街道', '1050', '');
INSERT INTO `area` VALUES ('1243', '200000804202', '竹镇镇', '1051', '');
INSERT INTO `area` VALUES ('1244', '200000802204', '桥林镇', '1052', '');
INSERT INTO `area` VALUES ('1245', '200000802205', '汤泉镇', '1052', '');
INSERT INTO `area` VALUES ('1246', '200000802206', '星甸镇', '1052', '');
INSERT INTO `area` VALUES ('1247', '200000804203', '雄州街道', '1051', '');
INSERT INTO `area` VALUES ('1248', '200000805202', '蒋王街道四联村', '1127', '');
INSERT INTO `area` VALUES ('1249', '200000805203', '蒋王街道悦来村', '1127', '');

SET FOREIGN_KEY_CHECKS = 1;

```
查询SQL：
```sql
SELECT parentId,GROUP_CONCAT(DISTINCT areaCode) 
FROM AREA
GROUP BY parentId
ORDER BY parentId
desc;
```



