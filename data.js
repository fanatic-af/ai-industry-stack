/*
 * AI Industry Taxonomy — site data
 * --------------------------------
 * Edit this file to change what the site shows. No build step needed.
 *
 * Companies are written as short strings inside L(...):
 *
 *   "Nvidia"                       plain name
 *   "+Oklo"                        leading +  = an example added on top of the original document (shows a ✦)
 *   "Etched@etched-ai"             @slug      = LinkedIn page linkedin.com/company/etched-ai
 *   "Google TPU~Google"            ~Parent    = a product of a bigger company (links to the parent's page)
 *   "Speak?Speak language app"     ?keyword   = what to search LinkedIn for when there is no confirmed page
 *   "Abridge#Healthcare,Insurance" #tags      = (L10 only) F1 industries; default is Horizontal
 *
 * The parts can be combined in any order after the name, e.g. "+Rufus~Amazon#Retail".
 *
 * LinkedIn link rule: an explicit @slug wins; otherwise a name (or parent) listed in SLUGS below
 * gets that page; anything else opens a LinkedIn company search for the name, which always works.
 * To confirm a company, find its page on LinkedIn and add it to SLUGS (or put @slug on the entry).
 *
 * Bucket fields: code, name, desc, companies, concepts (non-company examples), children (sub-buckets)
 */
(function () {
  // Confirmed (or near-certain) LinkedIn company page slugs, by company name.
  var SLUGS = {
    "Google": "google", "Google DeepMind": "googledeepmind", "OpenAI": "openai", "Anthropic": "anthropicresearch",
    "Microsoft": "microsoft", "Meta": "meta", "Apple": "apple", "Amazon": "amazon", "AWS": "amazon-web-services",
    "Nvidia": "nvidia", "AMD": "amd", "Intel": "intel-corporation", "Qualcomm": "qualcomm", "Samsung": "samsung-electronics",
    "IBM": "ibm", "Oracle": "oracle", "Databricks": "databricks", "Snowflake": "snowflake-computing", "Salesforce": "salesforce",
    "Adobe": "adobe", "Canva": "canva", "GitHub": "github", "Hugging Face": "huggingface", "Cisco": "cisco",
    "Cloudflare": "cloudflare", "Vercel": "vercel", "LangChain": "langchain", "Together AI": "togethercomputer",
    "Mistral AI": "mistralai", "Mistral": "mistralai", "ElevenLabs": "elevenlabsio", "Perplexity": "perplexity-ai",
    "Anysphere": "anysphere", "Groq": "groq", "Cerebras": "cerebras-systems", "SambaNova": "sambanova-systems",
    "Nebius": "nebius", "Modal": "modal-labs", "Red Hat": "red-hat", "Visa": "visa", "Mastercard": "mastercard",
    "Thomson Reuters": "thomson-reuters", "Khan Academy": "khan-academy", "Duolingo": "duolingo", "Intercom": "intercom",
    "StackBlitz": "stackblitz", "Zilliz": "zilliz", "Stripe": "stripe", "Datadog": "datadog", "Atlassian": "atlassian",
    "Figma": "figma", "Notion": "notionhq", "Shopify": "shopify", "Zendesk": "zendesk", "Tesla": "tesla-motors",
    "JetBrains": "jetbrains", "Weights & Biases": "wandb", "Lenovo": "lenovo", "HPE": "hewlett-packard-enterprise",
    "Dell": "delltechnologies", "Broadcom": "broadcom", "Arista": "arista-networks-inc", "Synthesia": "synthesia",
    "Descript": "descript", "Grammarly": "grammarly", "DeepL": "deepl", "Otter": "otter-ai", "Runway": "runwayml",
    "Jasper": "jasper-ai", "Scale AI": "scaleai", "Zoom": "zoom-video-communications", "Deepgram": "deepgram",
    "Pinecone": "pinecone-io", "Weaviate": "weaviate-io", "Qdrant": "qdrant", "Neo4j": "neo4j", "n8n": "n8n",
    "Zapier": "zapier", "Temporal": "temporal-technologies", "Arize": "arizeai", "Baseten": "baseten",
    "Fireworks": "fireworks-ai", "Equinix": "equinix", "Vertiv": "vertiv", "Schneider Electric": "schneider-electric",
    "Eaton": "eaton", "TSMC": "tsmc", "ASML": "asml", "Supermicro": "supermicro", "CoreWeave": "coreweave",
    "Moveworks": "moveworks", "Aidoc": "aidoc", "Waymo": "waymo", "Anduril": "anduril-industries", "Replit": "repl-it",
    "Isomorphic Labs": "isomorphic-labs", "VAST Data": "vast-data", "Micron": "micron-technology",
    "Shutterstock": "shutterstock", "Applied Materials": "applied-materials", "Synopsys": "synopsys",
    "Cadence": "cadence-design-systems", "Arm": "arm", "ABB": "abb"
  };

  function parse(s) {
    var o = { name: "", slug: null, of: null, q: null, added: false, ind: null };
    if (s.charAt(0) === "+") { o.added = true; s = s.slice(1); }
    var parts = s.split(/(?=[@~?#])/);
    o.name = parts[0].trim();
    for (var i = 1; i < parts.length; i++) {
      var p = parts[i], v = p.slice(1).trim();
      if (p[0] === "@") o.slug = v;
      else if (p[0] === "~") o.of = v;
      else if (p[0] === "?") o.q = v;
      else if (p[0] === "#") o.ind = v.split(",").map(function (x) { return x.trim(); });
    }
    if (!o.slug) o.slug = SLUGS[o.name] || (o.of && SLUGS[o.of]) || null;
    return o;
  }
  function L() { return Array.prototype.slice.call(arguments).map(parse); }

  window.TAXONOMY = {
    title: "AI Industry Taxonomy",
    asOf: "Oct 11, 2026",
    overview:
      "The AI (Artificial Intelligence) industry sorts into 11 layers. Layers L0 to L9 form the enabling stack, sorted by what a product provides to people building AI. Layer L10 holds applications, sorted by the model's core job for the end user.",
    mece:
      "Industry, modality, customer and pricing are filter tags, not buckets. That keeps the taxonomy MECE (Mutually Exclusive, Collectively Exhaustive): every product has exactly one home, and you filter within a bucket to analyse a slice of the market.",

    industries: ["Horizontal", "Legal", "Healthcare", "Finance", "Insurance", "Education", "Retail", "Manufacturing", "Media", "Government", "Science"],

    layers: [
      {
        id: "L0", name: "Physical infrastructure", icon: "⚡",
        tagline: "Where the power and floor space come from, increasingly the binding constraint on AI capacity.",
        test: "Does it supply electricity, land, buildings or cooling for compute?",
        buckets: [
          { code: "0.1", name: "Power generation and procurement", desc: "Utilities, nuclear and gas deals, on-site generation",
            companies: L("+Constellation Energy", "+Vistra", "+NRG Energy", "+Talen Energy", "+NextEra Energy", "+Dominion Energy", "+Duke Energy", "+Entergy",
              "+Brookfield Renewable", "+Bloom Energy", "+Oklo", "+NuScale Power", "+Kairos Power", "+X-energy", "+TerraPower", "+Fervo Energy",
              "+Helion Energy", "+Commonwealth Fusion Systems") },
          { code: "0.2", name: "Data center development and operation", desc: "Hyperscale campuses, colocation (e.g. the Stargate sites)",
            companies: L("Stargate~OpenAI", "+Equinix", "+Digital Realty", "+QTS Data Centers", "+Vantage Data Centers", "+Aligned Data Centers",
              "+CyrusOne", "+STACK Infrastructure", "+Switch?Switch data centers", "+EdgeCore Digital Infrastructure", "+Yondr", "+AirTrunk", "+NTT DATA",
              "+Iron Mountain Data Centers", "+Applied Digital", "+Core Scientific", "+IREN", "+TeraWulf", "+Lancium") },
          { code: "0.3", name: "Power and cooling equipment", desc: "Liquid cooling, electrical gear, grid interconnection",
            companies: L("+Vertiv", "+Schneider Electric", "+Eaton", "+ABB", "+Siemens Energy", "+GE Vernova", "+Hitachi Energy", "+Trane Technologies",
              "+Johnson Controls", "+nVent", "+Cummins", "+Caterpillar", "+Quanta Services", "+CoolIT Systems", "+LiquidStack", "+Motivair",
              "+Submer", "+GRC?Green Revolution Cooling", "+JetCool", "+Accelsius") }
        ]
      },
      {
        id: "L1", name: "Compute hardware", icon: "🔲",
        tagline: "The chips and systems that run the math.",
        test: "Is it a physical chip, system or the low-level software that makes that chip usable?",
        buckets: [
          { code: "1.1", name: "Semiconductor manufacturing", desc: "Foundry, advanced packaging such as CoWoS (Chip-on-Wafer-on-Substrate), lithography equipment, plus chip design tools and IP",
            companies: L("TSMC", "ASML", "+Samsung Foundry~Samsung", "+Intel Foundry~Intel", "+GlobalFoundries", "+SMIC", "+Rapidus", "+Amkor Technology",
              "+ASE Group", "+Applied Materials", "+Lam Research", "+KLA", "+Tokyo Electron", "+Advantest", "+Besi?BE Semiconductor Industries",
              "+Synopsys", "+Cadence", "+Arm"),
            concepts: ["TSMC = Taiwan Semiconductor Manufacturing Company", "CoWoS packaging"] },
          { code: "1.2", name: "Accelerators", desc: "The processors that do the matrix math",
            children: [
              { code: "1.2.1", name: "General-purpose GPUs", desc: "GPU = Graphics Processing Unit; includes other general-purpose AI accelerators",
                companies: L("Nvidia", "AMD", "+Intel Gaudi~Intel", "+Huawei Ascend~Huawei", "+Cambricon", "+Moore Threads", "+Biren Technology", "+MetaX") },
              { code: "1.2.2", name: "Hyperscaler custom ASICs", desc: "ASIC = Application-Specific Integrated Circuit",
                companies: L("Google TPU~Google", "AWS Trainium~AWS", "Meta MTIA~Meta", "Microsoft Maia~Microsoft", "+AWS Inferentia~AWS",
                  "+OpenAI custom accelerator~OpenAI", "+Broadcom XPUs~Broadcom", "+Marvell custom silicon~Marvell", "+Alchip"),
                concepts: ["TPU = Tensor Processing Unit"] },
              { code: "1.2.3", name: "Inference-specialized chips", desc: "Silicon built for serving models fast",
                companies: L("Groq", "Cerebras", "Etched", "SambaNova", "+Tenstorrent", "+d-Matrix", "+MatX", "+Positron?Positron AI", "+Taalas",
                  "+Fractile", "+Graphcore", "+Rebellions", "+FuriosaAI", "+Lightmatter") },
              { code: "1.2.4", name: "Edge and on-device NPUs", desc: "NPU = Neural Processing Unit",
                companies: L("Apple", "Qualcomm", "Intel", "+MediaTek", "+Google Tensor~Google", "+Hailo", "+Axelera AI", "+Ambarella", "+SiMa.ai",
                  "+Syntiant", "+Kneron", "+EdgeCortix") }
            ] },
          { code: "1.3", name: "Memory and storage", desc: "HBM (High Bandwidth Memory) and AI storage",
            companies: L("SK Hynix", "Samsung", "Micron", "VAST Data", "WEKA", "+DDN", "+Pure Storage", "+NetApp", "+Hammerspace", "+Kioxia",
              "+Sandisk", "+Western Digital", "+Seagate", "+MinIO") },
          { code: "1.4", name: "Networking and interconnect", desc: "NVLink, InfiniBand, AI Ethernet, optical interconnects",
            companies: L("NVLink / InfiniBand~Nvidia", "Broadcom", "Arista", "+Cisco", "+Marvell", "+Astera Labs", "+Credo", "+Juniper Networks~HPE",
              "+Cornelis Networks", "+Enfabrica", "+Ayar Labs", "+Celestial AI", "+Coherent", "+Lumentum", "+Ciena"),
            concepts: ["Optical interconnects"] },
          { code: "1.5", name: "Servers and integrated systems", desc: "Racks and full systems",
            companies: L("Supermicro", "Dell", "Nvidia rack-scale systems~Nvidia", "+HPE", "+Lenovo", "+Foxconn", "+Quanta Computer", "+Wistron",
              "+Wiwynn", "+Inspur", "+Celestica", "+Gigabyte", "+Oxide Computer") },
          { code: "1.6", name: "Hardware enablement software", desc: "Compilers and kernel libraries",
            companies: L("CUDA~Nvidia", "ROCm~AMD", "Triton~OpenAI", "+XLA~Google", "+oneAPI~Intel", "+Modular", "+Apache TVM?Apache TVM"),
            concepts: ["CUDA = Compute Unified Device Architecture", "ROCm = Radeon Open Compute"] }
        ]
      },
      {
        id: "L2", name: "Compute provisioning", icon: "☁️",
        tagline: "Who rents out the hardware.",
        test: "Is the customer paying for access to someone else's hardware?",
        buckets: [
          { code: "2.1", name: "Hyperscalers", desc: "The big general clouds",
            companies: L("AWS", "Microsoft Azure~Microsoft", "GCP~Google", "Oracle", "+Alibaba Cloud", "+IBM Cloud~IBM", "+Tencent Cloud",
              "+Huawei Cloud", "+Baidu AI Cloud"),
            concepts: ["GCP = Google Cloud Platform"] },
          { code: "2.2", name: "Neoclouds (GPU-first clouds)", desc: "Clouds built around GPU capacity",
            companies: L("CoreWeave", "Lambda?Lambda AI cloud", "Nebius", "Crusoe?Crusoe AI", "+Fluidstack", "+Voltage Park", "+Nscale", "+Vultr",
              "+TensorWave", "+Hyperbolic", "+Denvr Dataworks", "+DigitalOcean", "+Genesis Cloud", "+Sesterce", "+Scaleway", "+Firmus") },
          { code: "2.3", name: "GPU marketplaces and serverless GPU", desc: "Rent by the second or from a marketplace",
            companies: L("RunPod", "Vast.ai", "Modal", "+SF Compute", "+Prime Intellect Compute~Prime Intellect", "+Shadeform", "+TensorDock",
              "+Akash Network", "+io.net", "+Salad?SaladCloud", "+Beam?Beam Cloud", "+Cerebrium", "+Koyeb") },
          { code: "2.4", name: "Sovereign and national AI clouds", desc: "Region-specific capacity built for data residency",
            companies: L("+G42", "+Core42~G42", "+HUMAIN", "+Mistral Compute~Mistral AI", "+Yotta?Yotta Data Services", "+Krutrim Cloud~Krutrim",
              "+E2E Networks", "+Sakura Internet", "+SoftBank", "+Naver Cloud", "+Deutsche Telekom Industrial AI Cloud~Deutsche Telekom", "+OVHcloud") },
          { code: "2.5", name: "Cluster orchestration and scheduling", desc: "Slurm, Kubernetes-based GPU schedulers",
            companies: L("Slurm~SchedMD", "+Run:ai~Nvidia", "+Anyscale", "+SkyPilot", "+dstack", "+Rafay", "+ClearML"),
            concepts: ["Kubernetes GPU schedulers"] }
        ]
      },
      {
        id: "L3", name: "Training data", icon: "🧬",
        tagline: "Data that goes into model weights.",
        test: "Does this data end up baked into the weights during training?",
        buckets: [
          { code: "3.1", name: "Human expert data and RLHF", desc: "RLHF = Reinforcement Learning from Human Feedback",
            companies: L("Scale AI", "Surge AI", "Mercor", "Turing?Turing AI", "+Invisible Technologies", "+Labelbox", "+Snorkel AI", "+micro1",
              "+Handshake AI~Handshake", "+Outlier~Scale AI", "+Toloka", "+Appen", "+Sama", "+iMerit", "+Prolific", "+SuperAnnotate", "+Encord",
              "+Datacurve", "+CloudFactory", "+Centaur Labs") },
          { code: "3.2", name: "RL environments", desc: "RL = Reinforcement Learning. Simulated tasks and graders for training agentic and reasoning models",
            companies: L("+Mechanize", "+Prime Intellect", "+Halluminate", "+Bespoke Labs", "+Farama Foundation") },
          { code: "3.3", name: "Synthetic data generation", desc: "Model-generated training data",
            companies: L("+MOSTLY AI", "+Gretel~Nvidia", "+Tonic.ai", "+YData", "+Synthesis AI", "+Parallel Domain", "+Duality Robotics", "+Rendered.ai") },
          { code: "3.4", name: "Data licensing and marketplaces", desc: "Publishers, Reddit, stock media",
            companies: L("Reddit", "+Shutterstock", "+Getty Images", "+Associated Press", "+Axel Springer", "+News Corp", "+Stack Overflow",
              "+Wiley", "+Taylor & Francis", "+Defined.ai", "+Protege?Protege health data", "+Human Native AI", "+Created by Humans", "+TollBit",
              "+ProRata.ai"),
            concepts: ["Publishers", "Stock media"] },
          { code: "3.5", name: "Web-scale data acquisition", desc: "Crawling and scraping for pretraining",
            companies: L("Common Crawl", "+Bright Data", "+Oxylabs", "+Zyte", "+Apify", "+Diffbot") },
          { code: "3.6", name: "Data curation and processing", desc: "Deduplication, filtering, data-mix optimization",
            companies: L("DatologyAI", "+Cleanlab", "+Voxel51", "+Nomic AI", "+Activeloop", "+Lilac~Databricks", "+FineWeb datasets~Hugging Face") }
        ]
      },
      {
        id: "L4", name: "Models", icon: "🧠",
        tagline: "Trained weights, sorted by capability scope. Open-weight vs closed and size (frontier, mid-size, small/on-device) are tags, not buckets.",
        test: "Is the product the trained weights themselves?",
        buckets: [
          { code: "4.1", name: "General-purpose foundation models", desc: "Broad models that do a bit of everything",
            companies: L("OpenAI", "Anthropic", "Google DeepMind", "xAI", "Meta", "Mistral", "DeepSeek", "Alibaba Qwen~Alibaba?Alibaba Cloud",
              "Moonshot Kimi~Moonshot AI", "+Cohere Command~Cohere", "+Amazon Nova~Amazon", "+Microsoft AI (MAI, Phi)~Microsoft", "+AI21 Labs",
              "+Reka AI", "+Zhipu AI (GLM)~Zhipu AI", "+MiniMax", "+ByteDance Seed~ByteDance", "+Baidu ERNIE~Baidu", "+Tencent Hunyuan~Tencent",
              "+StepFun", "+01.AI", "+Thinking Machines Lab", "+Safe Superintelligence", "+Reflection AI", "+Nous Research",
              "+Ai2 (OLMo)~Allen Institute for AI", "+Sarvam AI", "+Krutrim", "+Aleph Alpha", "+LG AI Research (EXAONE)~LG AI Research",
              "+Naver HyperCLOVA X~Naver", "+Sakana AI", "+IBM Granite~IBM", "+Nvidia Nemotron~Nvidia", "+Liquid AI", "+Upstage",
              "+TII Falcon~Technology Innovation Institute") },
          { code: "4.2", name: "Modality-specialist models", desc: "Best-in-class at one kind of media",
            children: [
              { code: "4.2.1", name: "Image", companies: L("Midjourney", "Black Forest Labs", "Ideogram", "+Stability AI", "+Recraft", "+Krea",
                  "+Bria AI", "+Reve?Reve AI", "+GPT Image~OpenAI", "+Imagen / Nano Banana~Google", "+Seedream~ByteDance") },
              { code: "4.2.2", name: "Video", companies: L("Runway", "Luma?Luma AI", "Kling~Kuaishou", "Google Veo~Google", "OpenAI Sora~OpenAI",
                  "+Pika", "+Hailuo~MiniMax", "+Genmo", "+LTX~Lightricks", "+Moonvalley", "+Decart", "+Wan~Alibaba", "+Seedance~ByteDance",
                  "+HunyuanVideo~Tencent", "+Vidu~ShengShu") },
              { code: "4.2.3", name: "Speech and voice", desc: "STT (Speech-to-Text), TTS (Text-to-Speech), speech-to-speech",
                companies: L("ElevenLabs", "Cartesia", "Deepgram", "Kyutai", "+AssemblyAI", "+Speechmatics", "+Rev?Rev.com", "+Whisper / gpt-realtime~OpenAI",
                  "+Hume AI", "+Sesame?Sesame AI", "+Resemble AI", "+Rime?Rime Labs", "+Gladia", "+Soniox", "+LMNT", "+Fish Audio", "+WellSaid Labs") },
              { code: "4.2.4", name: "Music and audio", companies: L("Suno", "Udio", "+Stable Audio~Stability AI", "+Lyria~Google DeepMind",
                  "+Eleven Music~ElevenLabs", "+Riffusion", "+Mubert") },
              { code: "4.2.5", name: "3D and world models", desc: "3D = Three-Dimensional",
                companies: L("World Labs", "Google Genie~Google DeepMind", "+Odyssey?Odyssey ML", "+Oasis~Decart", "+Cosmos~Nvidia", "+Hunyuan3D~Tencent",
                  "+CSM?Common Sense Machines", "+SpAItial") }
            ] },
          { code: "4.3", name: "Domain-specialist models", desc: "Code; biology and chemistry; materials; weather; math",
            companies: L("Isomorphic Labs", "EvolutionaryScale", "+Profluent", "+Chai Discovery", "+Generate:Biomedicines", "+Recursion", "+Inceptive",
              "+Latent Labs", "+Arc Institute (Evo)~Arc Institute", "+Lila Sciences", "+Orbital Materials", "+CuspAI", "+Periodic Labs",
              "+WeatherNext~Google DeepMind", "+Earth-2~Nvidia", "+Brightband", "+Jua", "+Poolside", "+Magic?Magic.dev", "+Harmonic?Harmonic AI"),
            concepts: ["Code models", "Materials", "Weather"] },
          { code: "4.4", name: "Component models", desc: "Built as parts inside systems: embeddings, rerankers, document and OCR (Optical Character Recognition) models, safety classifiers",
            companies: L("+Cohere Embed and Rerank~Cohere", "+Voyage AI~MongoDB", "+Jina AI~Elastic", "+Nomic Embed~Nomic AI", "+Mixedbread",
              "+OpenAI embeddings~OpenAI", "+Mistral OCR~Mistral AI", "+Llama Guard~Meta"),
            concepts: ["Embeddings", "Rerankers", "OCR models", "Safety classifiers"] },
          { code: "4.5", name: "Embodied / robotics foundation models", desc: "VLA (Vision-Language-Action) models",
            companies: L("Physical Intelligence", "Skild AI", "Nvidia GR00T~Nvidia", "+Gemini Robotics~Google DeepMind", "+Figure Helix~Figure?Figure AI",
              "+Field AI", "+Genesis AI", "+Dyna Robotics", "+Generalist AI", "+Wayve", "+Toyota Research Institute") }
        ]
      },
      {
        id: "L5", name: "Model development tooling", icon: "🛠️",
        tagline: "Tools that create or change weights.",
        test: "Does using it produce new or modified weights?",
        buckets: [
          { code: "5.1", name: "ML frameworks", desc: "ML = Machine Learning",
            companies: L("PyTorch", "JAX~Google", "+TensorFlow~Google", "+Keras~Google", "+Transformers~Hugging Face", "+PaddlePaddle~Baidu", "+MindSpore~Huawei") },
          { code: "5.2", name: "Distributed training", desc: "Training across many accelerators",
            companies: L("DeepSpeed~Microsoft", "Megatron~Nvidia", "+NeMo~Nvidia", "+MaxText~Google", "+TorchTitan~Meta", "+Ray Train~Anyscale",
              "+Composer~Databricks", "+Nanotron~Hugging Face", "+Colossal-AI~HPC-AI Tech") },
          { code: "5.3", name: "Fine-tuning and post-training platforms", desc: "Adapt a base model to a task",
            companies: L("Unsloth", "Axolotl", "Tinker~Thinking Machines Lab", "OpenPipe", "+Predibase", "+Lamini", "+Adaptive ML", "+Arcee AI",
              "+Oumi", "+TRL~Hugging Face", "+Together Fine-Tuning~Together AI") },
          { code: "5.4", name: "Model compression", desc: "Quantization, distillation, pruning toolkits",
            companies: L("+Pruna AI", "+Neural Magic~Red Hat", "+TensorRT Model Optimizer~Nvidia", "+Multiverse Computing", "+Nota AI", "+Clika",
              "+Neural Compressor~Intel"),
            concepts: ["Quantization", "Distillation", "Pruning"] },
          { code: "5.5", name: "Experiment tracking and model registry", desc: "Keep track of runs and model versions",
            companies: L("Weights & Biases", "MLflow~Databricks", "+Comet?Comet ML", "+Neptune.ai", "+ClearML", "+Valohai", "+Hugging Face Hub~Hugging Face",
              "+Amazon SageMaker~AWS", "+Vertex AI~Google", "+Azure Machine Learning~Microsoft") }
        ]
      },
      {
        id: "L6", name: "Inference", icon: "🚀",
        tagline: "Tools and services that run weights.",
        test: "Does it run existing weights to produce outputs?",
        buckets: [
          { code: "6.1", name: "Serving engines", desc: "High-throughput, server-side. LLM = Large Language Model",
            companies: L("vLLM", "SGLang", "TensorRT-LLM~Nvidia", "TGI~Hugging Face", "+Dynamo~Nvidia", "+Triton Inference Server~Nvidia", "+LMDeploy",
              "+MLC LLM", "+Ray Serve~Anyscale", "+llm-d~Red Hat", "+MAX~Modular", "+BentoML", "+KServe"),
            concepts: ["TGI = Text Generation Inference"] },
          { code: "6.2", name: "Local and edge runtimes", desc: "Single-device",
            companies: L("llama.cpp?ggml", "Ollama", "LM Studio", "Apple MLX~Apple", "ExecuTorch~Meta", "+Core ML~Apple", "+LiteRT~Google",
              "+ONNX Runtime~Microsoft", "+Qualcomm AI Hub~Qualcomm", "+Jan?Jan AI", "+GPT4All~Nomic AI", "+llamafile~Mozilla", "+Nexa AI", "+WebLLM") },
          { code: "6.3", name: "Runtime optimization", desc: "Mostly features of 6.1, sometimes standalone startups",
            companies: L("+Tensormesh (LMCache)~Tensormesh", "+CentML~Nvidia"),
            concepts: ["Continuous batching", "KV (Key-Value) cache management and offloading", "Speculative decoding", "Disaggregated prefill/decode"] },
          { code: "6.4", name: "Inference providers", desc: "Per-token API (Application Programming Interface) access",
            companies: L("Together AI", "Fireworks", "Baseten", "DeepInfra", "Groq Cloud~Groq", "+Replicate", "+fal.ai", "+Cerebras Inference~Cerebras",
              "+SambaNova Cloud~SambaNova", "+Amazon Bedrock~AWS", "+Azure AI Foundry~Microsoft", "+Nebius AI Studio~Nebius",
              "+Inference Providers~Hugging Face", "+Workers AI~Cloudflare", "+Novita AI", "+SiliconFlow", "+FriendliAI", "+Featherless AI",
              "+Inference.net", "+Parasail"),
            concepts: ["Labs' first-party APIs"] },
          { code: "6.5", name: "Routing and gateways", desc: "One API, many models",
            companies: L("OpenRouter", "LiteLLM~BerriAI", "Portkey?Portkey AI", "+Martian?Martian AI router", "+Not Diamond", "+Requesty",
              "+AI Gateway~Cloudflare", "+Vercel AI Gateway~Vercel", "+Kong AI Gateway~Kong") }
        ]
      },
      {
        id: "L7", name: "Context and knowledge plumbing", icon: "🔌",
        tagline: "Data fed to models at runtime (training data lives in L3).",
        test: "Does it get data into the prompt at runtime?",
        buckets: [
          { code: "7.1", name: "Document ingestion and parsing", desc: "Turn files into model-ready text",
            companies: L("Unstructured", "Reducto", "LlamaParse~LlamaIndex", "+Docling~IBM", "+Datalab (Marker)~Datalab", "+Extend?Extend AI", "+Tensorlake",
              "+Unstract", "+Aryn", "+Sensible?Sensible.so", "+Document Intelligence~Microsoft", "+Document AI~Google", "+Instabase") },
          { code: "7.2", name: "Vector databases", desc: "Store and search embeddings",
            companies: L("Pinecone", "Weaviate", "Qdrant", "Milvus~Zilliz", "+Chroma", "+LanceDB", "+turbopuffer", "+Vespa.ai", "+Elasticsearch~Elastic",
              "+Atlas Vector Search~MongoDB", "+Redis", "+SingleStore", "+Marqo", "+Supabase"),
            concepts: ["pgvector (open source)"] },
          { code: "7.3", name: "Knowledge graphs and graph-based RAG", desc: "RAG = Retrieval-Augmented Generation",
            companies: L("Neo4j", "GraphRAG~Microsoft", "+TigerGraph", "+FalkorDB", "+Memgraph", "+Stardog", "+ArangoDB", "+WhyHow.AI", "+Cognee") },
          { code: "7.4", name: "Web search and retrieval APIs for agents", desc: "Give agents the live web",
            companies: L("Exa?Exa AI", "Tavily", "Firecrawl", "+Brave Search API~Brave", "+Sonar API~Perplexity", "+Parallel Web Systems", "+Linkup",
              "+You.com", "+SerpApi", "+Valyu", "+Jina Reader~Jina AI") },
          { code: "7.5", name: "Data connectors and sync", desc: "Pipelines that keep app data (Drive, Slack, CRMs, Customer Relationship Management systems) available to models",
            companies: L("+Airbyte", "+Fivetran", "+Merge?Merge API", "+Paragon?Paragon integrations", "+Nango", "+Ragie", "+Vectorize?Vectorize.io",
              "+Graphlit", "+Pathway?Pathway.com", "+Estuary") }
        ]
      },
      {
        id: "L8", name: "Orchestration and agent infrastructure", icon: "🕸️",
        tagline: "What turns a model into a system.",
        test: "Does it wire models, tools and memory together into a working system?",
        buckets: [
          { code: "8.1", name: "LLM application frameworks", desc: "SDK = Software Development Kit",
            companies: L("LangChain", "LlamaIndex", "DSPy", "Vercel AI SDK~Vercel", "+Haystack~deepset", "+Semantic Kernel~Microsoft", "+Mastra",
              "+Pydantic AI~Pydantic", "+BAML~Boundary", "+Genkit~Google", "+Instructor") },
          { code: "8.2", name: "Agent frameworks and SDKs", desc: "Libraries for building agent loops",
            companies: L("LangGraph~LangChain", "CrewAI", "OpenAI Agents SDK~OpenAI", "Claude Agent SDK~Anthropic", "Google ADK~Google",
              "+Microsoft Agent Framework (AutoGen)~Microsoft", "+Strands Agents~AWS", "+smolagents~Hugging Face", "+Agno", "+AG2", "+CAMEL-AI"),
            concepts: ["ADK = Agent Development Kit"] },
          { code: "8.3", name: "Protocols and standards", desc: "Shared plumbing between agents and tools",
            companies: L("MCP~Anthropic", "A2A~Google", "+AG-UI~CopilotKit", "+AP2 (Agent Payments Protocol)~Google",
              "+ACP (Agentic Commerce Protocol)~OpenAI", "+x402~Coinbase"),
            concepts: ["MCP = Model Context Protocol", "A2A = Agent2Agent"] },
          { code: "8.4", name: "Agent execution environments", desc: "Where agents actually run",
            children: [
              { code: "8.4.1", name: "Code sandboxes", companies: L("E2B", "Daytona", "+Modal Sandboxes~Modal", "+Vercel Sandbox~Vercel", "+Runloop",
                  "+CodeSandbox~Together AI", "+Morph?Morph Labs") },
              { code: "8.4.2", name: "Browser infrastructure", companies: L("Browserbase", "+Browser Use", "+Steel?Steel.dev", "+Hyperbrowser",
                  "+Anchor Browser", "+Kernel?Kernel browsers", "+Browserless") },
              { code: "8.4.3", name: "Durable workflow execution", companies: L("Temporal", "Inngest", "+Restate", "+Trigger.dev", "+Hatchet",
                  "+DBOS", "+Prefect") }
            ] },
          { code: "8.5", name: "Agent memory", desc: "Long-term state for agents",
            companies: L("Mem0", "Letta", "Zep?Zep AI", "+Supermemory", "+LangMem~LangChain") },
          { code: "8.6", name: "Agent identity, tool auth and payments", desc: "Let agents log in and pay",
            companies: L("Composio", "Arcade?Arcade.dev", "+Visa Intelligent Commerce~Visa", "+Mastercard Agent Pay~Mastercard",
              "+Stripe agent toolkit~Stripe", "+Auth0 for AI Agents~Okta", "+Stytch", "+WorkOS", "+Descope", "+Keycard", "+Skyfire",
              "+Payman", "+Nekuda", "+Pipedream Connect~Pipedream"),
            concepts: ["Payment-network agent programs"] },
          { code: "8.7", name: "Agent-builder platforms", desc: "Build agents without writing the loop",
            children: [
              { code: "8.7.1", name: "No/low-code workflow builders", companies: L("n8n", "Zapier", "Dify", "+Make?Make.com", "+Relevance AI",
                  "+Gumloop", "+Lindy", "+Stack AI", "+Flowise", "+Langflow", "+Copilot Studio~Microsoft", "+AgentKit~OpenAI", "+Voiceflow",
                  "+Botpress", "+MindStudio", "+Workato") },
              { code: "8.7.2", name: "Voice-agent platforms", companies: L("Vapi", "Retell?Retell AI", "+Bland AI", "+Synthflow", "+Pipecat~Daily",
                  "+LiveKit Agents~LiveKit", "+Ultravox~Fixie", "+Vocode", "+Thoughtly") }
            ] }
        ]
      },
      {
        id: "L9", name: "LLMOps and trust", icon: "🛡️",
        tagline: "How AI systems are measured, secured and governed. LLMOps stands for LLM Operations.",
        test: "Does it measure, secure or govern an AI system rather than run it?",
        buckets: [
          { code: "9.1", name: "Evaluation", desc: "Is the system any good?",
            companies: L("Braintrust?Braintrust data", "LangSmith~LangChain", "Patronus?Patronus AI", "+Galileo?Galileo AI", "+Confident AI (DeepEval)~Confident AI",
              "+Ragas", "+Vals AI", "+HoneyHive", "+Weave~Weights & Biases", "+Openlayer", "+Coval", "+Hamming AI", "+LMArena") },
          { code: "9.2", name: "Observability and tracing", desc: "What is it doing in production?",
            companies: L("Arize", "Langfuse", "Helicone", "+LLM Observability~Datadog", "+Opik~Comet", "+Laminar?Laminar AI", "+Traceloop",
              "+AgentOps", "+Fiddler AI", "+Arthur AI", "+Raindrop?Raindrop AI") },
          { code: "9.3", name: "Guardrails and runtime security", desc: "Prompt-injection defense, PII (Personally Identifiable Information) redaction, output filtering",
            companies: L("Lakera~Check Point?Lakera", "+Protect AI~Palo Alto Networks?Protect AI", "+Prompt Security~SentinelOne?Prompt Security",
              "+HiddenLayer", "+Robust Intelligence~Cisco", "+CalypsoAI~F5?CalypsoAI", "+Pangea~CrowdStrike?Pangea", "+Aim Security", "+Noma Security",
              "+Zenity", "+Guardrails AI", "+NeMo Guardrails~Nvidia") },
          { code: "9.4", name: "Red-teaming and model security testing", desc: "Attack it before others do",
            companies: L("+Haize Labs", "+Mindgard", "+Promptfoo", "+Gray Swan AI", "+Irregular?Irregular AI security", "+Apollo Research", "+METR",
              "+Adversa AI") },
          { code: "9.5", name: "GRC", desc: "GRC = Governance, Risk and Compliance. Audit trails, EU (European Union) AI Act compliance, model inventories",
            companies: L("+Credo AI", "+Holistic AI", "+Trustible", "+watsonx.governance~IBM", "+OneTrust AI Governance~OneTrust", "+FairNow",
              "+Monitaur", "+Saidot", "+Enzai", "+ModelOp") },
          { code: "9.6", name: "Content provenance", desc: "Watermarking, C2PA (Coalition for Content Provenance and Authenticity)",
            companies: L("+SynthID~Google DeepMind", "C2PA", "+Content Credentials~Adobe", "+Truepic", "+Digimarc", "+Steg.AI", "+IMATAG") }
        ]
      },
      {
        id: "L10", name: "Applications", icon: "✨",
        tagline: "Sorted by the model's core job for the end user, never by industry or modality. Archetypes are in tie-breaker order: when a product is ambiguous, the first one that fits wins.",
        test: "Does the customer use it to get work done (not to build AI)?",
        isApps: true,
        buckets: [
          { code: "A1", name: "Act", icon: "🦾", desc: "Executes multi-step tasks that change state in an external environment. Sub-buckets by environment.",
            children: [
              { code: "A1.1", name: "Business-system agents", desc: "APIs and SaaS (Software as a Service)",
                children: [
                  { code: "A1.1·a", name: "Support resolution",
                    companies: L("Sierra?Sierra AI", "Decagon", "Intercom Fin~Intercom", "+Agentforce~Salesforce", "+Zendesk AI agents~Zendesk",
                      "+Ada?Ada support", "+Forethought", "+Crescendo?Crescendo AI", "+Parloa", "+PolyAI", "+Cresta", "+Maven AGI", "+Lorikeet",
                      "+Kore.ai", "+Netomi", "+Gorgias AI~Gorgias#Retail") },
                  { code: "A1.1·b", name: "Sales and GTM", desc: "GTM = Go-To-Market. AI SDRs (Sales Development Representatives)",
                    companies: L("11x?11x.ai", "+Artisan?Artisan AI", "+Clay?Clay.com", "+Qualified (Piper)~Qualified", "+Regie.ai", "+Unify?Unify GTM",
                      "+AiSDR", "+Actively AI", "+Persana AI") },
                  { code: "A1.1·c", name: "Back-office", desc: "Finance, IT (Information Technology) and HR (Human Resources) operations agents",
                    companies: L("+Basis?Basis AI#Finance", "+Rillet#Finance", "+Digits#Finance", "+Moveworks", "+Serval?Serval IT", "+Atomicwork",
                      "+Paradox?Paradox.ai", "+Hippocratic AI#Healthcare", "+Tennr#Healthcare", "+Infinitus Systems#Healthcare",
                      "+Thoughtful AI#Healthcare", "+Notable Health#Healthcare", "+Assort Health#Healthcare", "+EliseAI") }
                ] },
              { code: "A1.2", name: "Computer-use and browser agents", desc: "Operate a screen like a person",
                companies: L("ChatGPT agent mode~OpenAI", "Perplexity Comet~Perplexity", "Manus?Manus AI", "+ChatGPT Atlas~OpenAI", "+Claude for Chrome~Anthropic",
                  "+Project Mariner~Google", "+Nova Act~Amazon", "+Genspark", "+Dia~The Browser Company", "+Opera Neon~Opera", "+Simular") },
              { code: "A1.3", name: "Software-engineering agents", desc: "Agents that write and ship code; app builders",
                companies: L("Claude Code~Anthropic", "Codex~OpenAI", "Devin~Cognition?Cognition AI", "Cursor agent~Anysphere", "Lovable", "Bolt~StackBlitz",
                  "Replit", "+Windsurf~Cognition?Cognition AI", "+Copilot coding agent~GitHub", "+Jules~Google", "+Gemini CLI~Google", "+Kiro~AWS",
                  "+Junie~JetBrains", "+Factory?Factory AI", "+Augment Code", "+Amp~Sourcegraph", "+Cline", "+Kilo Code", "+Roo Code",
                  "+OpenHands~All Hands AI", "+Warp", "+Zed?Zed Industries", "+v0~Vercel", "+Base44~Wix", "+Emergent?Emergent Labs") },
              { code: "A1.4", name: "Physical-world agents", desc: "Robots, AVs (Autonomous Vehicles), drones and defense",
                companies: L("Figure?Figure AI#Manufacturing", "1X?1X Technologies", "Waymo", "Anduril#Government", "+Optimus~Tesla#Manufacturing",
                  "+Agility Robotics#Manufacturing,Retail", "+Apptronik#Manufacturing", "+Boston Dynamics#Manufacturing", "+Unitree Robotics",
                  "+Zoox~Amazon", "+Aurora Innovation", "+Kodiak Robotics", "+Pony.ai", "+Apollo Go~Baidu", "+WeRide", "+Nuro",
                  "+Shield AI#Government", "+Skydio#Government", "+Helsing#Government", "+Saronic#Government", "+Zipline#Healthcare,Retail",
                  "+Diligent Robotics#Healthcare", "+Serve Robotics#Retail", "+Dexterity#Retail", "+Symbotic#Retail", "+Bright Machines#Manufacturing",
                  "+Machina Labs#Manufacturing", "+Hadrian#Manufacturing", "+Carbon Robotics") }
            ] },
          { code: "A2", name: "Interact", icon: "💬", desc: "The ongoing interaction is itself the product.",
            children: [
              { code: "A2.1", name: "Companions and social characters",
                companies: L("Character.ai", "Replika", "+Talkie~MiniMax", "+Chai?Chai Research", "+Nomi AI", "+Kindroid", "+Grok companions~xAI",
                  "+Tolan~Portola", "+Friend?Friend.com") },
              { code: "A2.2", name: "Tutors and learning",
                companies: L("Khanmigo~Khan Academy#Education", "Speak?Speak language learning#Education", "+Duolingo Max~Duolingo#Education",
                  "+ChatGPT study mode~OpenAI#Education", "+Praktika#Education", "+Synthesis Tutor~Synthesis#Education", "+Ello?Ello learning#Education",
                  "+Loora#Education", "+Brainly#Education") },
              { code: "A2.3", name: "Practice and simulation", desc: "Interview and sales role-play trainers",
                companies: L("+Yoodli", "+Hyperbound", "+Second Nature?Second Nature AI", "+Mursion#Education", "+CAISY~Skillsoft") },
              { code: "A2.4", name: "Coaching and wellbeing", desc: "Ongoing personal guidance",
                companies: L("+Wysa#Healthcare", "+Ash~Slingshot AI#Healthcare", "+Sonia?Sonia AI therapy#Healthcare", "+Pi~Inflection AI", "+Rosebud?Rosebud journal",
                  "+Ebb~Headspace#Healthcare", "+Whoop Coach~Whoop#Healthcare", "+Oura Advisor~Oura#Healthcare", "+Lark Health#Healthcare", "+BetterUp") },
              { code: "A2.5", name: "Entertainment and game characters",
                companies: L("Inworld?Inworld AI#Media", "+Convai#Media", "+AI Dungeon~Latitude#Media", "+Hidden Door#Media",
                  "+Showrunner~Fable Simulation#Media", "+ACE~Nvidia#Media") }
            ] },
          { code: "A3", name: "Retrieve", icon: "🔎", desc: "Answers grounded in a knowledge source beyond the prompt. Sub-buckets by source.",
            children: [
              { code: "A3.1", name: "Private organizational knowledge", desc: "Glean, internal RAG assistants",
                companies: L("Glean", "+Hebbia#Finance,Legal", "+Rovo~Atlassian", "+Amazon Q Business~AWS", "+Gemini Enterprise~Google", "+Guru?Guru knowledge",
                  "+Sana~Workday", "+Dashworks~HubSpot", "+Coveo", "+Onyx?Onyx AI", "+Credal") },
              { code: "A3.2", name: "Licensed or curated domain corpora", desc: "Answers from expert sources",
                companies: L("Harvey?Harvey AI#Legal", "OpenEvidence#Healthcare", "+CoCounsel~Thomson Reuters#Legal", "+Lexis+ AI~LexisNexis#Legal",
                  "+Legora#Legal", "+Vincent~vLex#Legal", "+Rogo#Finance", "+AlphaSense#Finance", "+Fintool#Finance", "+Brightwave#Finance",
                  "+Doximity GPT~Doximity#Healthcare", "+UpToDate Expert AI~Wolters Kluwer#Healthcare", "+Glass Health#Healthcare",
                  "+Elicit#Science", "+Consensus?Consensus AI#Science", "+Scite#Science", "+Causaly#Science", "+Patsnap#Science") },
              { code: "A3.3", name: "Open web", desc: "Search engines and deep-research products",
                companies: L("Perplexity", "ChatGPT deep research~OpenAI", "+AI Mode~Google", "+Grok DeepSearch~xAI", "+Kagi Assistant~Kagi",
                  "+Phind", "+You.com", "+Websets~Exa?Exa AI") },
              { code: "A3.4", name: "Structured data", desc: "Text-to-SQL (Structured Query Language) and conversational BI (Business Intelligence)",
                companies: L("Databricks Genie~Databricks", "Snowflake Cortex~Snowflake", "+Spotter~ThoughtSpot", "+Hex Magic~Hex?Hex Technologies",
                  "+Julius AI", "+Tableau Agent~Salesforce", "+Power BI Copilot~Microsoft", "+Amazon Q in QuickSight~AWS", "+Wren AI", "+Vanna AI",
                  "+Zenlytic", "+Fabi.ai") },
              { code: "A3.5", name: "Media archives", desc: "Video and image search",
                companies: L("Twelve Labs#Media", "+Ask Photos~Google", "+Moments Lab#Media", "+Coactive AI#Media") },
              { code: "A3.6", name: "Personal memory", desc: "Search over one's own meetings, screen history, notes",
                companies: L("+Windows Recall~Microsoft", "+NotebookLM~Google", "+Limitless~Meta?Limitless AI", "+Bee~Amazon?Bee AI", "+Mem?Mem.ai", "+Screenpipe") }
            ] },
          { code: "A4", name: "Judge", icon: "⚖️", desc: "Outputs a verdict, label, score or prediction about the input.",
            children: [
              { code: "A4.1", name: "Classification and moderation",
                companies: L("Hive?Hive AI#Media,Government", "+ActiveFence#Media", "+Checkstep#Media", "+Unitary?Unitary AI#Media", "+Cinder?Cinder trust and safety#Media",
                  "+Musubi#Media") },
              { code: "A4.2", name: "Scoring and ranking", desc: "Candidate screening, lead scoring, underwriting",
                companies: L("+Eightfold AI", "+HireVue", "+Juicebox?Juicebox recruiting", "+6sense", "+Sixfold#Insurance", "+Cytora#Insurance",
                  "+Federato#Insurance", "+Zest AI#Finance", "+Upstart#Finance") },
              { code: "A4.3", name: "Detection", desc: "Fraud, anomalies, deepfakes, visual defect inspection, medical imaging triage",
                companies: L("Aidoc#Healthcare", "+Viz.ai#Healthcare", "+Qure.ai#Healthcare", "+Lunit#Healthcare", "+Paige?Paige AI#Healthcare",
                  "+PathAI#Healthcare", "+Overjet#Healthcare", "+Cleerly#Healthcare", "+Tractable#Insurance", "+Shift Technology#Insurance",
                  "+Sardine#Finance", "+Feedzai#Finance", "+Featurespace~Visa#Finance", "+Unit21#Finance", "+Socure#Finance", "+Pindrop#Finance",
                  "+Sift?Sift fraud#Retail", "+Riskified#Retail", "+Forter#Retail", "+Abnormal AI?Abnormal Security", "+Darktrace", "+Vectra AI",
                  "+Reality Defender#Media,Government", "+GetReal Security#Government", "+Landing AI#Manufacturing", "+Instrumental#Manufacturing",
                  "+Elementary?Elementary ML#Manufacturing", "+ZeroEyes#Government", "+Flock Safety#Government") },
              { code: "A4.4", name: "Review and audit", desc: "Contract review, code review, compliance checks",
                companies: L("CodeRabbit", "+Greptile", "+Bugbot~Anysphere", "+Qodo", "+Graphite?Graphite dev", "+Semgrep Assistant~Semgrep",
                  "+Spellbook#Legal", "+Ironclad AI~Ironclad#Legal", "+LegalOn#Legal", "+Luminance#Legal", "+Kira~Litera#Legal", "+Norm Ai#Finance",
                  "+Anterior#Healthcare", "+Cohere Health#Healthcare") },
              { code: "A4.5", name: "Prediction and forecasting", desc: "Demand, risk, weather products",
                companies: L("+o9 Solutions#Retail,Manufacturing", "+Blue Yonder#Retail", "+RELEX Solutions#Retail", "+Kinaxis#Manufacturing",
                  "+Aera Technology#Manufacturing", "+Pecan AI", "+Kumo AI", "+Tomorrow.io", "+Jupiter Intelligence#Insurance", "+ZestyAI#Insurance") }
            ] },
          { code: "A5", name: "Transform", icon: "🔁", desc: "Re-expresses given content in a new form, with its information preserved.",
            children: [
              { code: "A5.1", name: "Modality conversion", desc: "Speech to text, text to speech (narration, audiobooks), image or document to text (OCR apps)",
                companies: L("Wispr Flow~Wispr", "Otter", "+Superwhisper", "+Aqua Voice", "+Willow Voice", "+MacWhisper", "+Speechify",
                  "+ElevenReader~ElevenLabs", "+Murf AI", "+Audible AI narration~Amazon#Media", "+Be My Eyes", "+Seeing AI~Microsoft") },
              { code: "A5.2", name: "Language conversion", desc: "Translation, dubbing and live translation",
                companies: L("DeepL", "ElevenLabs Dubbing~ElevenLabs#Media", "Rask?Rask AI#Media", "+HeyGen Translate~HeyGen#Media", "+Dubverse#Media",
                  "+Unbabel", "+Lilt", "+Smartcat", "+Wordly?Wordly AI", "+KUDO", "+Sanas", "+Timekettle", "+Live Translation~Apple",
                  "+Google Translate~Google") },
              { code: "A5.3", name: "Structure conversion", desc: "Extraction and form-filling, invoice processing, ambient scribing and meeting notes",
                companies: L("Abridge#Healthcare", "Granola?Granola AI", "+Ambience Healthcare#Healthcare", "+Dragon Copilot~Microsoft#Healthcare",
                  "+Suki#Healthcare", "+Nabla#Healthcare", "+DeepScribe#Healthcare", "+Heidi Health#Healthcare", "+Freed?Freed AI#Healthcare",
                  "+Rad AI#Healthcare", "+Fireflies.ai", "+Fathom?Fathom video", "+Read AI", "+tl;dv", "+Plaud", "+Supio#Legal",
                  "+Ocrolus#Finance", "+Vic.ai#Finance", "+Klarity#Finance", "+Rossum", "+Hyperscience#Government,Insurance", "+Nanonets",
                  "+Roots Automation#Insurance") },
              { code: "A5.4", name: "Length and style conversion", desc: "Summarization, rewriting, grammar",
                companies: L("Grammarly", "+QuillBot", "+Wordtune~AI21 Labs", "+LanguageTool", "+ProWritingAid", "+SciSpace#Science", "+Scholarcy#Science") },
              { code: "A5.5", name: "Media enhancement and editing", desc: "Upscaling, noise and background removal, footage editing. Agentic video editing lands here, since the footage already exists",
                companies: L("Descript#Media", "+Topaz Labs#Media", "+Photoshop Generative Fill~Adobe#Media", "+Captions?Captions app#Media",
                  "+OpusClip#Media", "+CapCut~ByteDance#Media", "+Gling#Media", "+Magnific~Freepik", "+Photoroom#Retail", "+Pixelcut#Retail",
                  "+remove.bg~Canva", "+Krisp") }
            ] },
          { code: "A6", name: "Create", icon: "🎨", desc: "Generates novel content from intent. Sub-buckets by output.",
            children: [
              { code: "A6.1", name: "Text and copy",
                companies: L("Jasper", "Writer?Writer AI", "+Copy.ai", "+Typeface", "+Anyword", "+Hypotenuse AI#Retail", "+HyperWrite~OthersideAI",
                  "+Sudowrite#Media", "+NovelAI#Media", "+EvenUp#Legal", "+DraftWise#Legal") },
              { code: "A6.2", name: "Image",
                companies: L("Midjourney app~Midjourney#Media", "Ideogram#Media", "+Firefly~Adobe#Media", "+Leonardo.Ai~Canva#Media", "+Krea#Media",
                  "+Freepik AI~Freepik#Media", "+Recraft", "+Playground?Playground AI", "+Lensa~Prisma Labs", "+Civitai#Media",
                  "+Botika#Retail", "+Flair.ai#Retail", "+Pebblely#Retail") },
              { code: "A6.3", name: "Video", desc: "Including avatars and synthetic presenters",
                companies: L("Runway#Media", "Sora app~OpenAI#Media", "Kling~Kuaishou#Media", "Synthesia", "HeyGen", "+Pika#Media",
                  "+Dream Machine~Luma?Luma AI#Media", "+Flow~Google#Media", "+LTX Studio~Lightricks#Media", "+Hedra#Media", "+Higgsfield#Media",
                  "+invideo AI#Media", "+Colossyan#Education", "+D-ID", "+Tavus", "+Argil#Media", "+Arcads#Retail", "+Creatify#Retail") },
              { code: "A6.4", name: "Audio and music", desc: "Including sound effects",
                companies: L("Suno#Media", "Udio#Media", "+Sound Effects~ElevenLabs#Media", "+AIVA#Media", "+Soundraw#Media", "+Beatoven.ai#Media",
                  "+Boomy#Media", "+Loudly#Media", "+Wondercraft#Media") },
              { code: "A6.5", name: "3D assets and worlds", desc: "Game-asset tools",
                companies: L("Meshy?Meshy AI#Media", "+Tripo AI#Media", "+Kaedim#Media", "+Rodin~Hyper3D#Media", "+Sloyd#Media", "+Spline AI~Spline",
                  "+Scenario?Scenario gg#Media", "+Layer AI#Media", "+Roblox Cube~Roblox#Media") },
              { code: "A6.6", name: "Design, documents and presentations",
                companies: L("Canva AI~Canva", "Gamma?Gamma app", "+Figma Make~Figma", "+Adobe Express~Adobe", "+Microsoft Designer~Microsoft",
                  "+Stitch~Google", "+Uizard~Miro", "+Beautiful.ai", "+Napkin AI", "+Plus AI", "+Lovart", "+Looka", "+Kittl") },
              { code: "A6.7", name: "Code generation (single-shot)", desc: "Autocomplete, snippet generation",
                companies: L("+Copilot autocomplete~GitHub", "+Cursor Tab~Anysphere", "+Tabnine", "+Gemini Code Assist~Google",
                  "+Amazon Q Developer~AWS", "+JetBrains AI Assistant~JetBrains", "+Continue?Continue dev", "+Mistral Code~Mistral AI") }
            ] },
          { code: "A7", name: "General assistants", icon: "🌐", desc: "Deliberately span all archetypes, with no dominant pattern.",
            children: [
              { code: "A7.1", name: "Lab-native assistants",
                companies: L("ChatGPT~OpenAI", "Claude~Anthropic", "Gemini~Google", "+Grok~xAI", "+Le Chat~Mistral AI", "+DeepSeek app~DeepSeek",
                  "+Qwen Chat~Alibaba", "+Kimi~Moonshot AI", "+Doubao~ByteDance", "+Yuanbao~Tencent", "+ERNIE Bot~Baidu", "+Poe~Quora") },
              { code: "A7.2", name: "Platform-embedded assistants",
                companies: L("Meta AI~Meta", "Microsoft Copilot~Microsoft", "Apple Intelligence~Apple", "+Microsoft 365 Copilot~Microsoft", "+Alexa+~Amazon",
                  "+Galaxy AI~Samsung", "+Notion AI~Notion", "+Zoom AI Companion~Zoom", "+Slack AI~Salesforce", "+My AI~Snap",
                  "+Rufus~Amazon#Retail", "+Sidekick~Shopify#Retail") }
            ] }
        ]
      }
    ],

    filterTags: [
      ["F1", "Industry", "Horizontal, legal, healthcare, finance, insurance, education, retail, manufacturing, media, government, science"],
      ["F2", "Business function", "Support, sales and marketing, engineering, finance, HR, legal, operations, IT and security, creative"],
      ["F3", "Interface modality", "Input → output, e.g. text→text, voice→voice, text→video, sensors→action"],
      ["F4", "Customer", "Developer, consumer, prosumer, SMB (Small & Medium Business), enterprise, government"],
      ["F5", "Autonomy", "Copilot (human drives), agent (human approves), autonomous"],
      ["F6", "Pricing", "Per-seat, usage or per-token, per-outcome, freemium"],
      ["F7", "Deployment", "Cloud API, self-hosted or on-prem, on-device"],
      ["F8", "Form factor", "Standalone app, embedded in existing software, browser, API-only, device or wearable"],
      ["F9", "Model strategy", "Own model, fine-tuned open-weight, third-party API"],
      ["F10", "Secondary archetypes", "E.g. Harvey: A3 primary, A6 and A4 secondary"]
    ],

    rules: [
      ["The unit is a product, not a company.", "ElevenLabs' TTS API sits in 4.2.3 and 6.4, its dubbing tool in A5.2, its agent platform in 8.7.2."],
      ["Builder vs. user.", "If the customer uses it to build AI, it goes in L0 to L9. If the customer uses it to get work done, it goes in L10."],
      ["Training vs. runtime.", "Data for weights goes in L3, data for prompts in L7. Tools that change weights go in L5, tools that run weights in L6."],
      ["One primary archetype in L10:", "whatever the customer pays for. Other patterns go in F10."],
      ["Tie-breaker order:", "Act → Interact → Retrieve → Judge → Transform → Create. A7 holds only products designed with no dominant pattern."]
    ]
  };
})();
