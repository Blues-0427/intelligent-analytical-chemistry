"""Independently recompute published metrics from CSV; no model loading needed."""
import csv,json,pathlib,math,hashlib,argparse
import numpy as np
B=pathlib.Path(__file__).resolve().parents[2]
ap=argparse.ArgumentParser();ap.add_argument('--results',type=pathlib.Path,default=B/'resources/annual/2026-2027/results/ch15');args=ap.parse_args();OUT=args.results
DATA=B/'data/ch15'
m=json.loads((OUT/'metrics.json').read_text(encoding='utf-8'))
rows=list(csv.DictReader((OUT/'predictions.csv').open(encoding='utf-8-sig')))
manifest=list(csv.DictReader((DATA/'sample_manifest.csv').open(encoding='utf-8-sig')))
labels=['Carbonate','Sulphate','Phosphate']
ids=[r['rruff_id'] for r in rows]
assert len(ids)==len(set(ids))==280
assert set(ids)=={r['rruff_id'] for r in manifest}
excluded={r['rruff_id'] for r in csv.DictReader((DATA/'pilot_excluded_ids.csv').open(encoding='utf-8-sig'))}
assert len(excluded)==340 and not(set(ids)&excluded)
for role,n in m['role_counts'].items():assert sum(r['role']==role for r in rows)==n
known=[r for r in rows if r['role']=='known_test'];unknown=[r for r in rows if r['role']=='unknown_test']
def near(a,b):assert math.isclose(a,b,rel_tol=1e-10,abs_tol=1e-10),(a,b)
for r in rows:
    a=np.array([float(r['p_before_'+str(k)]) for k in range(3)])
    b=np.array([float(r['p_after_'+str(k)]) for k in range(3)])
    near(a.sum(),1);near(b.sum(),1);assert a.argmax()==b.argmax()
    expected=a**(1/m['temperature']);expected/=expected.sum()
    assert np.allclose(expected,b,atol=1e-12)
for prefix,key in [('p_before_','known_before'),('p_after_','known_after')]:
    loss=[];bs=[];bins=[[] for _ in range(5)];correct=0
    for r in known:
        y=labels.index(r['true_label']);p=[float(r[prefix+str(k)]) for k in range(3)]
        good=p.index(max(p))==y;correct+=good;loss.append(-math.log(p[y]));bs.append(sum((v-(k==y))**2 for k,v in enumerate(p)))
        bins[min(4,int(max(p)*5))].append((max(p),good))
    ece=sum(abs(sum(c for c,g in b)-sum(g for c,g in b)) for b in bins if b)/len(known)
    near(correct/36,m[key]['accuracy']);near(sum(loss)/36,m[key]['nll']);near(sum(bs)/36,m[key]['brier']);near(ece,m[key]['ece_5_equal_bins'])
for key,score in [('tq_rejection',lambda r:float(r['ad_score'])),('msp_reference',lambda r:1-float(r['confidence_after']))]:
    s=m[key];th=s['threshold'];ak=[r for r in known if score(r)<=th];au=[r for r in unknown if score(r)<=th]
    assert len(ak)==s['known_accepted'] and len(au)==s['unknown_accepted']
    err=sum(r['true_label']!=r['predicted_label'] for r in ak);assert err==s['accepted_known_errors']
    near(err/len(ak),s['accepted_known_error_rate'])
    auc=sum((score(u)>score(k))+.5*(score(u)==score(k)) for u in unknown for k in known)/(len(unknown)*len(known))
    near(auc,s['unknown_positive_auroc'])
    val=sorted(score(r) for r in rows if r['role']=='threshold_validation')
    near(val[math.ceil(.9*(len(val)-1))],th)
data=np.load(DATA/'selected_spectra.npz',allow_pickle=False)
assert data['X'].shape==(280,501) and np.isfinite(data['X']).all()
assert len({hashlib.sha256(x.astype('<f8').tobytes()).hexdigest() for x in data['X']})==280
assert [r['seed'] for r in m['sensitivity_runs']]==[2026102901,2026102902,2026102903,2026102904,2026102905]
report={'status':'passed','rows':280,'known_final_test':36,'unknown_final_test':100,'pilot_overlap':0,'checks':['CSV metrics independently recomputed','probabilities normalized','temperature relation and argmax','pairwise AUROC','validation-only threshold quantiles','role counts and unique groups','finite spectra and exact duplicates','five explicit seeds']}
(OUT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
