# 第15章可复核拉曼实验

从仓库根目录运行，建议Python 3.12及独立虚拟环境：

```text
python -m pip install -r code/ch15_exercises/requirements.txt
python code/ch15_exercises/verify_results.py
python code/ch15_exercises/run_case.py --output .ch15-reproduction
python code/ch15_exercises/verify_results.py --results .ch15-reproduction
node code/ch15_exercises/check_site.cjs
```

先核验归档结果，再将完整5个种子重新算入临时目录，不覆盖年度归档。`--primary-only`仅重算主种子。完整已用环境见environment.lock.txt；从干净源码导出的本组复核仍不等于非本组独立复现。

数据在data/ch15，年度原输出在resources/annual/2026-2027/results/ch15。图件随重新计算写入指定输出目录的figures；网站引用的已归档SVG/PNG在assets/ch15。本组输入、规则与数值结果没有因网站接入而重新挑选。

需要重建选谱时：`python code/ch15_exercises/prepare_data.py --source 本地源库路径`；省略--source将下载约285 MB的固定Zenodo v1并核对SHA256。不能删除pilot_excluded_ids.csv后选样。

532 nm、已处理、非定向的RRUFF参考谱，200–1200 cm⁻¹共501点。以编号保守隔离；三个理想式基团规则类各60个、留出未知100个，共280个，排除全部340个先导编号。数据字段、许可和变换见data/ch15/README.md及LICENSE_AND_SOURCES.md。规则标签不替代全面矿物学真值，未知组不是实际部署的随机未知总体。

训练90、概率校准30、阈值验证24、已知测试36、未知测试100。主种子2026102901；4个补充种子明确列出。PCA与逻辑回归在训练内部四折选择，温度和阈值来自各自专用数据。已知准确率22/36，NLL 1.566→1.295；T²/Q主规则接受34个已知，其中13错，并接受81/100个未知。两次敏感性划分NLL变差，全部结果保留。

网页只显示固定输出，不在浏览器拟合。用`python -m http.server 8000`从根目录预览，再打开`http://localhost:8000/#/docs/ch15`。独立阈值页位于assets/ch15/threshold-lab.html，也可直接离线打开。搜索或下载问题应区分公共基线与本章改动。浏览器测试状态见年度verification.md。

## GitHub文件阅读与网站运行

GitHub文件预览中的章节链接应打开同一分支的实际文件；下载链接可进入对应文件页。网站运行时恢复Docsify路由和项目内下载地址。GitHub不执行章节中的交互JavaScript：点击HTML文件会查看源码，交互演示按上面的本地预览方法运行，或在课程网站合并更新后使用。

链接中的提交SHA表示固定历史快照；后续修复不会改写旧提交。核查最新内容时请使用当前PR的分支版本。
