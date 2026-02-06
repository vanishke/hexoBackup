---
title: Java api client实现Elasticsearch泛型接口
categories:
	- Elasticsearch
tags: 
	- Elasticsearch
	
date: 2025-05-30 17:05:12
updated: 2025-05-30 17:05:12
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Linux：CentOS Linux release 7.9.2009 (Core)
ElasticSearch： 8.8.0

# <span id="inline-blue">描述</span>

Elasticsearch升级8.8.0版本后，官方已经弃用之前RestHighLevel方式client,推荐使用java api client方式，于是通过实现通用接口，将常用针对索引的增删改查都统一进行实现。

# <span id="inline-blue">实现</span>

## <span id="inline-blue">Asset</span>

```java

@Setter
@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
@Index(indexName = "asset")
public class Asset {

  /**
   * SerialId
   */
  private static final long serialVersionUID = 5984488053116280354L;

  /**
   * 资源ID
   */
  @Id
  @JsonProperty("resourceId")
  private String resourceId;

  /**
   * 资源名称
   */

  @JsonProperty("assetName")
  private String assetName;

  /**
   * 资源名称全拼(包含导演、主演)
   */
  @JsonProperty("letterFull")
  private List<String> letterFull;

  /**
   * 资源名称首字母缩写
   */
  @JsonProperty("initialLetter")
  private List<String> initialLetter;

  /**
   * 标题全拼
   */
  @JsonProperty("headLetter")
  private String headLetter;

  /**
   * 标题长度
   */
  @JsonProperty("headLetterLength")
  private Integer headLetterLength;

  /**
   * 主演、导演全拼 ";" 分割
   * */
  @JsonProperty("actorDirectorLetter")
  private List<String> actorDirectorLetter;

  /**
   * 年份
   */
  @JsonProperty("year")
  private String year;

  /**
   * 点播次数
   */
  @JsonProperty("vodCount")
  private Long vodCount;

  /**
   * 用户推荐级别
   */
  @JsonProperty("userRecommendLevel")
  private Long userRecommendLevel;

  /**
   * 推荐等级
   */
  @JsonProperty("recommendationLevel")
  private Integer recommendationLevel;

  /**
   * 资源排序
   */
  @JsonProperty("resourceRank")
  private Long resourceRank;

  /**
   * 评分
   */
  @JsonProperty("score")
  private Float score;

  /**
   * 虚拟推荐数
   */
  @JsonProperty("virrecommandcount")
  private Long virrecommandcount;

  /**
   * 创建时间
   */
  @JsonProperty("createTime")
  private Long createTime;

  /**
   * 发行时间
   */
  @JsonProperty("publishDate")
  private Long publishDate;

  /**
   * 操作时间
   */
  @JsonProperty("optTime")
  private Long optTime;

  /**
   * 展示类型
   */
  @JsonProperty("showType")
  private String showType;

  /**
   * 产地名称
   */
  @JsonProperty("originName")
  private String originName;

  /**
   * 视频类型  SD：标清  HD：高清
   */
  @JsonProperty("videoType")
  private String videoType;

  /**
   * 媒资类型 1：电影 2：电视剧 3：综艺 4：动漫 5：纪录片 6：广告 7：专题 8：其他
   */
  @JsonProperty("assetTypes")
  private String assetTypes;

  /**
   * 记录类型 0：电影 1:资源包
   */
  @JsonProperty("packaged")
  private Integer packaged;

  /**
   * 标签
   */
  @JsonProperty("tag")
  private String tag;

  /**
   * 标签年份
   */
  @JsonProperty("tagYear")
  private String tagYear;

  /**
   * 平台类型 1：STB 2：OTT 3：ALL
   */
  @JsonProperty("platform")
  private String platform;

  /**
   * 站点ID
   */
  @JsonProperty("siteId")
  private Integer siteId;

  /**
   * 导演
   */
  @JsonProperty("director")
  private String director ;

  /**
   * 主演
   */
  @JsonProperty("leadingActor")
  private String leadingActor;

  /**
   * 关键词
   *
   */
  @JsonProperty("keyword")
  private String keyword;

  /**
   * 媒资上架栏目父栏目集合(包含当前栏目)
   */
  @JsonProperty("columnId")
  private List<Long> columnId;

  /**
   * 资源上架栏目ID
   */
  @JsonProperty("columnID")
  private Long columnID;

  public Long getColumnID() {
    return columnID;
  }
  public void setColumnID(Long columnID) {
    this.columnID = columnID;
  }

  public List<Long> getColumnId() {
    return columnId;
  }
  public void setColumnId(List<Long> columnId) {
    this.columnId = columnId;
  }

}
```

## <span id="inline-blue">Program</span>

```java

@Setter
@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
@Index(indexName = "program")
public class Program {

  /**
   * 节目单ID
   */
  @Id
  @JsonProperty("programGuideId")
  private Long programGuideId;

  /**
   * 节目名称
   */
  @JsonProperty("eventName")
  private String eventName;

  /**
   * 节目名称拼音
   */
  @JsonProperty("eventNamePinyin")
  private String eventNamePinyin;

  /**
   * 开始时间
   */
  @JsonProperty("beginTime")
  private Long beginTime;

  /**
   * 结束时间
   */
  @JsonProperty("endTime")
  private Long endTime;

  /**
   * 节目日期
   */
  @JsonProperty("eventDate")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd", timezone = "GMT+8")
  private Date eventDate;

  /**
   * 视频类型
   */
  @JsonProperty("videoType")
  private String videoType;
}
```

## <span id="inline-blue">注解@Id</span>

```java
@Target( { ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface Id {
}

```

## <span id="inline-blue">注解@Index</span>

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
public @interface Index {

  String indexName();
}

```

## <span id="inline-blue">接口实现</span>

## <span id="inline-blue">BaseElasticRepository</span>

```java
public class BaseElasticRepository<T, PK extends Serializable> {

  protected ElasticsearchClient client;
  protected Class<T> entityClass;
  protected String indexName;

  private static final ObjectMapper objectMapper = new ObjectMapper();

  protected List<String> compositeIdFields = new ArrayList<>();

  /**
   * 设置组合ID字段的方法
   */
  protected void initCompositeIdFields() {
    // 默认空实现，子类按需覆盖
  }

  private String resolveDocumentId(T document) throws Exception {
    if (!CommonUtil.isEmpty(compositeIdFields)) {
      return EntityHelper.getCompositeIdValue(document, compositeIdFields);
    }
    return String.valueOf(EntityHelper.getIdValue(document));
  }

  /**
   *  BaseElasticRepository初始化
   */
  public BaseElasticRepository() {
    try {
      this.entityClass = getEntityClass();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    this.indexName = Optional.ofNullable(entityClass.getAnnotation(Index.class))
            .map(Index::indexName)
            .orElseThrow(() -> new IllegalArgumentException("实体类需标注@Index"));
  }

  /**
   * 查询class对应索引是否存在
   * @return
   * @throws IOException
   */
  public boolean exists() throws IOException {

    // 检查索引是否存在
    return client.indices()
            .exists(ExistsRequest.of(e -> e.index(indexName)))
            .value();
  }

  public RefreshResponse refresh() throws IOException {

    return client.indices()
            .refresh(RefreshRequest.of(e -> e.index(indexName)));
  }

  /**
   *  创建索引
   * @return
   * @throws IOException
   */
  public boolean createIndex() throws IOException {
    return client.indices().create(create -> create.index(indexName)).acknowledged();
  }

  public IndexResponse save(T document) throws Exception {

    byte[] jsonBytes = objectMapper.writeValueAsBytes(document);
    //获取Document对象ID
    String id = resolveDocumentId(document);
    //写入ES
    IndexResponse indexResponse = client.index(index -> index
            .index(indexName)
            .id(id)
            .withJson(new ByteArrayInputStream(jsonBytes)));
    return indexResponse;
  }


  public BulkResponse bulkInsert(List<T> entityList) throws Exception {

    if (CommonUtil.isEmpty(entityList)) {
      throw new IllegalArgumentException("Entity list cannot be null or empty");
    }
    BulkRequest.Builder br = new BulkRequest.Builder();

    for (T entity : entityList) {
      br.operations(op -> op
              .index(idx -> {
                        try {
                          return idx
                                  .index(indexName)
                                  .id(resolveDocumentId(entity))
                                  .document(entity);
                        } catch (Exception e) {
                          throw new RuntimeException(e);
                        }
                      }
              )
      );
    }
    return client.bulk(br.build());
  }


  public BulkResponse bulkDelete(List<T> entityList) throws IOException {
    BulkRequest.Builder builder = new BulkRequest.Builder();
    for (T entity : entityList) {
      builder.operations(op -> op.delete(i ->
              {
                try {
                  return i.index(indexName)
                          .id(resolveDocumentId(entity));
                } catch (Exception e) {
                  throw new RuntimeException(e);
                }
              }
      ));
    }
    return client.bulk(builder.build());
  }

  public BulkResponse bulkUpdate(List<T> entityList) throws Exception {
    if (CommonUtil.isEmpty(entityList)) {
      throw new IllegalArgumentException("Entity list cannot be null or empty");
    }
    BulkRequest.Builder br = new BulkRequest.Builder();

    for (T entity : entityList) {
      String docId = resolveDocumentId(entity);
      br.operations(op -> op
              .update(upd -> {
                try {
                  return upd
                          .index(indexName)
                          .id(docId)
                          .action(a -> a
                                  .doc(entity)
                                  .docAsUpsert(true)
                          );
                } catch (Exception e) {
                  throw new RuntimeException(e);
                }
              })
      );
    }
    return client.bulk(br.build());
  }


  public UpdateResponse update(T document) throws Exception {
    String id = resolveDocumentId(document);
    UpdateResponse updateResponse = client.update(update -> update
                    .index(indexName)
                    .id(id)
                    .doc(document)
                    .docAsUpsert(true)
            , Map.class);
    return updateResponse;
  }

  public DeleteResponse delete(T document) throws Exception {

    String id =  resolveDocumentId(document);
    DeleteResponse deleteResponse = client.delete(del -> del
            .index(indexName)
            .id(id));
    return deleteResponse;
  }

  public GetResponse<T> findById(PK id) throws Exception {
    // 直接通过文档 ID 查询（非字段匹配）
    GetResponse<T> response = client.get(
            GetRequest.of(g -> g
                    .index(indexName)
                    .id(id.toString())
            ),
            entityClass
    );
    return response;
  }

  /**
   * 清除索引数据
   * @return
   * @throws IOException
   */
  public DeleteByQueryResponse truncate() throws IOException {
    DeleteByQueryResponse response = client.deleteByQuery(d -> d
            .index(indexName)
            .query(q -> q
                    .matchAll(m -> m)
            )
    );
    return response;
  }

  private Class<T> getEntityClass() throws Exception {
    Type genType = this.getClass().getGenericSuperclass();
    if (genType instanceof ParameterizedType) {
      Class<T> genClass = (Class<T>) ((ParameterizedType) genType)
              .getActualTypeArguments()[0];
      return genClass;
    }
    throw new Exception(getClass().getName()
            + "BaseElasticRepository<T>,T需要定义");
  }

  public ElasticsearchClient getClient() {
    return client;
  }

  public void setClient(ElasticsearchClient client) {
    this.client = client;
  }
}
```

## <span id="inline-blue">AssetElasticsearchRepository</span>

```java
public class AssetElasticsearchRepository extends BaseElasticRepository<Asset,String> {

  private static Logger logger = LoggerFactory.getLogger(AssetElasticsearchRepository.class);

  public AssetElasticsearchRepository() {
    initCompositeIdFields();
  }
  @Override
  protected void initCompositeIdFields() {
    // 指定组合ID字段（按顺序）
    compositeIdFields.add(Constant.RESOURCE_ID);
    compositeIdFields.add(Constant.COLUMN_ID_VALUE);
  }
}
```

## <span id="inline-blue">ProgramElasticsearchRepository</span>

```java
public class ProgramElasticsearchRepository extends BaseElasticRepository<Program,String> {

}
```

## <span id="inline-blue">功能描述</span>

Asset、Program实体类使用@Id、@index注解，标识Elasticsearch对应索引ID、index名称，BaseElasticRepository通用接口基于java api  client方式实现Elasticsearch 针对索引增删改查以及批量操作，索引文档ID使用自定义组合ID，更加方便针对组合ID查询文档信息。