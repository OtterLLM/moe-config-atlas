"use strict";

/* ---------- language, and the Chinese text for the static markup ----------
   Loaded before the CDN echarts script and app.js, so a Chinese page shows Chinese from its first paint instead of the
   English markup while echarts downloads. Classic scripts share one global scope: app.js reads LANG, ZH, ZH_STATIC and
   ZH_ATTR from here and must not declare them again.
   LANG is "en" or "zh": the ?lang= URL parameter, else localStorage["lang"], else "en" (never the browser's language).
   Static markup in index.html is English and carries data-i18n="key" (innerHTML) and data-i18n-attr="attr:key;..."
   hooks; ZH_STATIC and ZH_ATTR hold the Chinese for those keys. */
const LANG = (() => {
  let l = null;
  try { l = new URLSearchParams(location.search).get("lang"); } catch (e) {}
  if (l !== "zh" && l !== "en") { l = null; try { l = localStorage.getItem("lang"); } catch (e) {} }
  return l === "zh" ? "zh" : "en";
})();
const ZH = LANG === "zh";
document.documentElement.lang = ZH ? "zh-CN" : "en";

// Chinese text for the data-i18n / data-i18n-attr hooks in index.html (the markup itself is English).
const ZH_STATIC = {
  "title": "MoE Config Atlas",
  "lede": "2025 年以来开源 MoE 大模型的稀疏度与形状。每个配置直接从 Hugging Face 上的 <code>config.json</code> 解析，每周自动更新。",
  "loading": "加载中…",
  "fold.all": "全部折叠",
  "vendor.all": "全部厂家",
  "sec.sparsity": "稀疏度",
  "c.param.t": "参数激活比",
  "c.param.s": "激活参数 / 总参数，横轴为总参数（对数）",
  "c.ek.t": "路由稀疏度 E/k",
  "c.ek.s": "路由专家数 / 每 token 选中数",
  "c.ek2.t": "专家数与 top-k",
  "c.ek2.s": "斜线是等 E/k 线；点越靠右下越稀疏",
  "c.gran.t": "专家粒度 G",
  "c.gran.s": "G = 2d / d<sub>expert</sub>，越大专家越细；LatentMoE 不计",
  "sec.shape": "形状与注意力",
  "c.aspect.t": "宽深比 d/L",
  "c.aspect.s": "隐藏维度 / token mixer 层数，横轴为激活参数（对数）",
  "c.attn.t": "注意力宽度比",
  "c.attn.s": "全局层 query 头数 × 每头 QK 维度 / d_model；1× 即头数 × 头维 = d。横轴为首发时间",
  "c.heads.t": "注意力宽度与 d_model",
  "c.heads.s": "纵轴是 query 头数 × 每头 QK 维度，斜线是等宽度比线",
  "c.global.t": "全局注意力层占比",
  "c.global.s": "其余是线性、Mamba 或滑窗层；横轴为首发时间",
  "c.kv.t": "长上下文 KV cache",
  "c.kv.s": "每 token 的 bf16 KV 缓存（KiB），只计全局注意力层",
  "c.ctx.t": "最大上下文",
  "c.ctx.s": "config 里的 max_position_embeddings；横轴为首发时间",
  "lay.h": "逐层结构",
  "lay.sub": "每行一个配置，每格是一层 token mixer，从第一层排到最后一层。格子越高，这一层的 KV 缓存随上下文涨得越多：全局和稀疏注意力最高，滑窗和分块一半，线性注意力、Mamba 和短卷积的状态大小固定，最矮。悬停看每一层，点型号加入并排对比；按归一均分或单个榜单排序，可以看榜单上靠前的模型用的是什么层。随上面的筛选变化。<span class=\"take\" id=\"lay-take\"></span>",
  "sec.features": "结构特征",
  "fp.h": "结构指纹",
  "fp.sub": "每行一个配置：左边是形状数值，右边是 <span id=\"fp-n\">33</span> 项结构特征，格子里是具体取值（窗口大小、稀疏注意力种类、超连接路数等）。点列名排序（第一次降序，第二次升序，第三次取消）；按归一均分或单个榜单排序时，最左边多一列分数，可以看表现好的模型都用了哪些结构。按档位分组时，小、中、大三档各排一段，排序只在档内进行，方便比较同一档的模型，每档第一行是这一档的汇总；按厂家汇总看各厂家的采用比例。随上面的筛选变化。",
  "cmp.h": "并排对比",
  "cmp.sub": "最多 4 个配置，数值行的细条按所选型号里的最大值缩放，取值相同的行显示为灰色。默认是最近发布过大模型（≥500B）的 4 家各自最新的一个；选择会写进网址，可以直接分享。",
  "cmp.diff": "只看不同",
  "adopt.h": "按季度的采用率",
  "adopt.sub": "每行一项结构特征，每列一个季度，颜色越深，当季首发的配置里用它的越多；按两年之间涨了多少排序。悬停看具体型号；随上面的筛选变化。<span class=\"take\" id=\"adopt-take\"></span>",
  "sec.details": "设计细节对照",
  "det.sub": "同一个位置上各家怎么写：每种写法的公式、来源，和用它的配置。门、sigmoid、归一化和缩放的细节多数在建模代码里，这里逐个对照 config 和代码核对，规则在 <code>details.yaml</code>。点型号可以加入上面的并排对比；随上面的筛选变化。",
  "sec.tech": "前沿技术追踪",
  "tech.sub": "2024 年以来的结构和训练改动（加上几项还在扩散的老方法）：最早的出处、独立实验测到的效果、收录的模型里谁在用。采用数从 config 自动统计，随上面的筛选变化；config 看不出的（比如优化器）只列技术报告里写明的。",
  "tech.th.name": "技术",
  "tech.th.src": "出处",
  "tech.th.eff": "独立实验里的效果",
  "tech.th.use": "收录模型的采用",
  "tech.note": "效果栏的数字多数来自 Pavlichenko 2026 的 1,129 次消融（d=512–1280，指标是每字节比特数，负数更好），以及 Marin 的预训练提速记录和 535B-A23B 训练配置。小模型上的结论不一定外推到大模型。",
  "vend.h": "各厂家的演化",
  "vend.sub": "每行一家厂家，按第一次出现的时间排；每个点是一个配置，横轴是首发时间，点越大总参数越大（对数），颜色是注意力类型，和逐层结构同色：混了线性层的算线性，其次是稀疏注意力、滑窗。悬停看配置，点击加入并排对比；随上面的筛选变化。<span class=\"take\" id=\"vendor-take\"></span>",
  "table.h": "全表",
  "table.sub": "默认按最近上传排序；型号是同架构里最新的版本，下面的小字是同架构的其他版本（只换了后训练、上下文或权重格式）。点列名排序，点一行看全部版本和备注，标“衍生”的是在它上面做的专用模型或换了格式的副本；「榜单」分组里是归一均分、各榜分数和取分的版本。",
  "defs.h": "口径",
  "d1.t": "E / k / s",
  "d1.d": "路由专家数 / 每 token 选中的路由专家数 / 共享专家数。逐层不同的模型取均值或众数，表中标 ≈。",
  "d2.t": "E/k",
  "d2.d": "路由稀疏度，只看路由专家。",
  "d3.t": "专家激活比 A",
  "d3.d": "(k + s) / (E + s)，把共享专家也算进去。",
  "d4.t": "参数激活比",
  "d4.d": "激活参数 / 总参数，两者取自模型卡或技术报告（config 里没有）。",
  "d5.t": "G",
  "d5.d": "2d / d<sub>expert</sub>，d 是隐藏维度。和标准 FFN 宽度 8d/3 比，G≈2.7 相当于\"一个专家 = 一个 dense FFN\"。",
  "d6.t": "d/L",
  "d6.d": "宽深比：隐藏维度除以 token mixer 层数（注意力、线性注意力或 Mamba 层）。LongCat 每层有两个注意力子层，按两层计。",
  "d7.t": "注意力宽度比",
  "d7.d": "全局注意力层的 query 头数 × 每个头的 Q·K 维度，再除以 d_model。头数 × 头维 = d 的 Llama 式设计为 1；MLA 的 Q·K 维度是不加位置的部分加 RoPE 部分（DeepSeek V3 是 128 + 64），DeepSeek V4 系每头 512 维，所以到 6.4–9.1。比值越大，注意力相对残差流越宽。",
  "d8.t": "Q/KV",
  "d8.d": "全局层每个 KV 头对应几个 query 头（GQA 的分组大小），越大 KV cache 越省。MLA 缓存的是压缩潜向量，不适用。",
  "d9.t": "RoPE 维度占比",
  "d9.d": "全局层每个头里加 RoPE 的维度比例。1 是全部维度；1/4、1/3 之类是部分 RoPE，其余维度不带位置；0 记为 NoPE，位置信息交给滑窗层、分块层、线性层或 Mamba 层，括号里是例外（Inkling 改用学到的相对位置 logit；North Mini Code 的第一个全局层是 dense 层，仍加 RoPE）。Mistral Large 4 每 4 层有一层不加 RoPE，NoPE 列记为“18/72 层”。MLA 按 RoPE 维度 / Q·K 维度算。",
  "d10.t": "全局注意力层占比",
  "d10.d": "KV 缓存随上下文增长的层（full、MLA、DSA、稀疏或压缩注意力）占全部 token mixer 层的比例。线性注意力、Mamba、短卷积的状态大小固定，滑窗层和 Llama 4 的分块层只缓存窗口或块内的 token。",
  "d11.t": "KV cache / token",
  "d11.d": "上下文足够长时每多一个 token 要多存的 bf16 KV：全局层数 × 每层每 token 的 K、V 维度 × 2 字节。MLA 按 kv_lora_rank + RoPE 维度算；DeepSeek V4 的压缩层按压缩率摊到每个 token（CSA 每 4 个 token 存一条，HCA 每 128 个）。不含线性层状态、滑窗缓存和稀疏注意力的索引键；DeepSeek V4.1 改了压缩配置的写法，暂不计算。",
  "d12.t": "注意力",
  "d12.d": "按 config.json 里的层类型字段推断（layer_types、kda_layers、full_attention_interval 等），只数 token mixer 的种类和层数，细节以技术报告为准。",
  "d13.t": "结构特征",
  "d13.d": "按 config.json 的字段识别，config 里没有写的部分（比如 Qwen3 的 QK-norm、gpt-oss 的 sink、各家的路由打分函数）对照 transformers 5.21 和厂家仓库里的建模代码核对，规则在 <code>scripts/hfconfig.py</code> 的 <code>ARCH</code> 里。config 未公开或看不出的记为\"?\"，不计入采用率。",
  "d14.t": "结构指纹",
  "d14.d": "形状数值按全部配置的五分位上色，只表示在收录范围内的相对大小；格子里的值和全表一致。按档位分组时每档的第一行、按厂家汇总时的格子，是用了该特征的配置数 / 看得出用没用的配置数；档位汇总行的形状数值是这一档的中位数。",
  "d15.t": "线性注意力",
  "d15.d": "状态大小固定的 token mixer：Gated DeltaNet（GDN）、Kimi Delta Attention（KDA）、MiniMax 和百灵 Ring linear、Ling 2.5 / 2.6 的 Lightning Attention、Mamba-2，以及 LFM2 的门控短卷积（表中记为“门控卷积”）。",
  "d16.t": "稀疏注意力",
  "d16.d": "每个 query 只看部分 KV：DeepSeek 的 DSA、LongCat 的 LSA（DSA 的 top-k 预算里固定留开头和最近的 token，并跨层复用索引）、Qwen3.8-Flash-Next 的 QSA、Step-5 的 CSA、MiniMax M3 的块稀疏、Ring-mini-sparse 的 MoBA（KV 分块，每个 query 只读选中的几块）、DeepSeek V4 的压缩注意力（CSA + HCA）。ERNIE 5.5 Flash 大部分层是 HCA，每 7 层一个 MLA+DSA 层，记为 DSA+HCA。",
  "d17.t": "输出门",
  "d17.d": "softmax 注意力层的输出乘一个由输入算出的门（Gated Attention，多数用 sigmoid，Laguna 用 softplus），每个头一个标量的记\"逐头\"，每个元素一个的记\"逐元素\"，config 没写明的记 ✓。线性注意力层自带的门不算。",
  "d18.t": "Sink / QK-norm",
  "d18.d": "Sink 是每个头一个可学习的 logit，让注意力可以\"什么都不看\"；QK-norm 是对每个头的 Q、K 做 RMSNorm（Llama 4 Scout 和 ZAYA1 用 L2 归一化，Scout 只在 RoPE 层用；Ling 2.5 / 2.6 只在 Lightning 层用）。MLA 对低秩潜向量的归一化不算 QK-norm。",
  "d19.t": "K=V / 跨层 KV / 索引复用",
  "d19.d": "K=V：K 和 V 用同一个投影，只缓存一份。跨层 KV：后面的层直接读前面源层的 KV，自己不再存。索引复用：稀疏注意力的 top-k 选择由几层共用（IndexShare、跨层索引），省掉索引器的计算。",
  "d20.t": "QKV 短卷积",
  "d20.d": "softmax 注意力的 Q、K、V 先沿序列过一个因果深度卷积（Primer 提出）。Inkling 对 K、V 和两个子层的输出各加一个 4 抽头卷积；ZAYA1 的 CCA 在压缩的潜空间里对 Q、K 做卷积。线性注意力层里自带的短卷积不算。",
  "d21.t": "长度缩放（SSMax）",
  "d21.d": "全局层把 query 按位置的 log 放大，长上下文里注意力不被摊平（Scalable-Softmax）。Llama 4 叫温度调节，Beam、Inkling 也只用在不加 RoPE 的全局层；Mistral Large 4 每层都用，系数按头学习（记为“逐头可学习”）。",
  "d22.t": "超连接",
  "d22.d": "把残差流扩成 n 路并用可学习的权重混合（Hyper-Connections）；mHC 用 Sinkhorn 把混合矩阵约束成双随机矩阵；iHC 是 Hy4 的写法。",
  "d23.t": "AttnRes",
  "d23.d": "Attention Residuals：每层的输入由对前面各层（按块）输出的注意力加权得到，代替固定的残差相加。",
  "d24.t": "残差门 / 后置 norm",
  "d24.d": "残差门：子层输出和残差按逐通道的可学习权重相加（Muse Spark 是保方差的门，ZAYA1 是两边各一组缩放）。后置 norm：子层输出再过一次 norm，前后都有的叫三明治，只在残差相加之后的叫 Post-LN，A.X K1 只在 MoE 输出后加。",
  "d25.t": "GatedNorm / 并行块",
  "d25.d": "GatedNorm：RMSNorm 的输出再乘一个由它算出的低秩 sigmoid 门，格子里是秩。并行块：注意力和 FFN 读同一个输入，输出一起加回残差（Cohere）。",
  "d26.t": "共享专家门",
  "d26.d": "共享专家的输出再乘一个由输入算出的门：Qwen 系是单独的 sigmoid 门，Inkling 让路由器给共享专家也打分（\"路由加权\"）。",
  "d27.t": "零计算专家",
  "d27.d": "不做计算的空专家，路由选中它就等于这个 token 少算一个专家（LongCat 的零计算专家、ZAYA1 的跳过专家），格子里是个数。",
  "d28.t": "路由",
  "d28.d": "打分函数（softmax、sigmoid、sqrtsoftplus）、无辅助损失的专家偏置（按分位数更新的记\"分位数\"，只在训练时用、权重里没有的记\"仅训练\"）、先选组再选专家的分组路由、前几层按 token id 哈希分配专家的哈希路由。",
  "d29.t": "FFN 激活 / 限幅",
  "d29.d": "多数是 SwiGLU；Gemma 4 用 GeGLU，gpt-oss 和 MiniMax M3 用带限幅和偏移的 SwiGLU（SwiGLU-OAI），Nemotron 3 用 ReLU²，Kimi K3 用 SiTU。限幅是把 SwiGLU 的输出截到上限，括号里是只在部分层；SiTU 用 β·tanh(x/β) 软限幅。",
  "d30.t": "MTP",
  "d30.d": "多 token 预测模块的层数；config 没写的从权重索引里数 mtp 层（需申请访问的仓库读公开副本的索引），读不到的记\"?\"。",
  "d31.t": "softcap",
  "d31.d": "输出 logit 过 c·tanh(x/c) 的软截断，格子里是 c。",
  "d32.t": "N-gram 记忆",
  "d32.d": "用哈希过的 n-gram 查一张大嵌入表：Engram 和 Qwen3.8-Flash-Next 在中间层注入，LongCat 加在输入嵌入上。",
  "d33.t": "设计细节对照",
  "d33.d": "每个位置（注意力输出门、路由权重、残差相加、norm 等）列出收录模型里出现过的写法，公式按建模代码写；config 和代码都看不出的记为“细节未公开”。“相关工作”是论文或训练配置里的写法，收录的模型还没用。名单和匹配规则在 <code>details.yaml</code>，构建时检查每个模型都归到了某种写法下。",
  "d34.t": "前沿技术追踪",
  "d34.d": "名单在 <code>techniques.yaml</code>，每条有最早出处、独立实验的结果和链接。采用数由结构特征自动统计；config 看不出的技术（优化器、损失函数）只列技术报告里写明的，没有就留空，不靠猜。",
  "d35.t": "config 来源",
  "d35.d": "仓库需申请访问时，config 取自 transformers 里对应的默认配置或公开副本，存档在本仓库的 <code>configs/</code> 下，并在表格详情里注明。",
  "d36.t": "榜单分数",
  "d36.d": "两个公开榜单的分数，用来给配置排序，每次构建时重新读取。ECI 是 Epoch AI 的能力指数（Epoch Capabilities Index），由 GPQA Diamond、SWE-bench Verified、HLE、FrontierMath 等几十项 benchmark 的成绩拟合成一个数，开源和闭源模型在同一把尺子上；Arena 是 arena.ai（原 LMArena）文本榜的分数，来自用户对匿名回答的两两投票，用的是默认的 style control 榜，更接近聊天体验而不是 benchmark。榜单上的名字和每个配置的型号、仓库名和同架构的各个版本对上（规则在 <code>scripts/bench.py</code>，对不上的写在 <code>bench.yaml</code>），同一架构取最高分，并注明取自哪个版本：这些版本只换了后训练，架构还是这一个。分数只反映收录时的版本，小模型和地区性模型覆盖得少。两个榜的数据都按 CC BY 4.0 使用。Artificial Analysis 的智能指数没有收录：它的条款不允许把分数做成表格或数据文件公开。",
  "d37.t": "归一均分",
  "d37.d": "两个榜的尺度不同（ECI 大约 120–160，Arena 是 1300–1500 上下的 Elo 分），收录的配置也不一样，所以先把每个榜换成标准分：（分数 − 均值）÷ 标准差，均值和标准差都按两个榜都有分的那些配置来算，只上了一个榜的配置也就和同一组配置比。每个配置平均它有分数的榜，最后把站内最高记 100、最低记 0。只上了一个榜的配置会标出来（如“仅 Arena”），它的均分只代表那一个榜。哪个榜都没有的配置排在最后。",
  "d38.t": "档位",
  "d38.d": "按总参数：小 ≤ 50B，中 50–500B，大 ≥ 500B。",
  "d39.t": "收录范围",
  "d39.d": "2025 年及以后首次上传的开源 MoE。架构完全相同（注意力、MoE、层数和各维度、模态、词表都一样），只改了后训练、上下文长度、MTP 层或权重格式的版本合并为一行，型号显示其中最新的版本；架构有任何不同就单独成行。每次构建都会读取每个版本的 config.json 核对。",
  "foot": "数据来自各模型在 Hugging Face 上的 config.json 与模型卡；榜单分数来自 <a href=\"https://epoch.ai/benchmarks\">Epoch AI</a> 和 <a href=\"https://arena.ai/leaderboard/text\">Arena</a> 文本榜（CC BY 4.0）。发现错误请到 <a href=\"https://github.com/OtterLLM/moe-config-atlas/issues\">GitHub issues</a> 反馈。",
};
const ZH_ATTR = {
  "meta.desc": "2025 年以来开源 MoE 大模型的稀疏度与形状统计，数据每周从 Hugging Face config.json 自动更新。",
  "theme.label": "切换深浅色",
  "filters.label": "筛选",
  "q.ph": "搜索型号或厂家",
  "vendor.label": "厂家",
  "tiles.label": "分档统计",
  "sort.label": "排序",
  "view.label": "视图",
  "colgroups.label": "列分组",
  "cmp.ph": "输入型号加入对比",
  "cmp.label": "加入对比的型号",
  "featgroups.label": "特征分组",
  "posgroups.label": "位置分组",
  "techcats.label": "技术分类",
  "lang.label": "语言",
};
function applyStatic() {
  if (!ZH) return;
  document.querySelectorAll("[data-i18n]").forEach((el) => { const t = ZH_STATIC[el.dataset.i18n]; if (t != null) el.innerHTML = t; });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    for (const pair of el.dataset.i18nAttr.split(";")) {
      const [attr, key] = pair.split(":");
      if (ZH_ATTR[key] != null) el.setAttribute(attr, ZH_ATTR[key]);
    }
  });
}

applyStatic(); // before the folds in app.js wrap the headings
document.querySelectorAll("#lang button").forEach((b) => {
  const on = b.dataset.lang === LANG;
  b.setAttribute("aria-pressed", String(on));
  if (on) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
});
