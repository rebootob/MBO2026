# Formula & Calculated Field Deep Comparison Matrix

> **Document Status:** Complete (Discovery Phase)  
> **Last Updated:** 2026-08-23  

---

## 1. Actual Kintone Calculation Expressions by App

```
[ App 283: PMS Staff & Chief ]
- total_score: mbo_point_obj1+mbo_point_obj2+mbo_point_obj3+mbo_point_obj4
- partA_weighted: ROUND((total_score*70)/100, 2)
- partB_raw: (competency_1+competency_2+competency_3+competency_4+competency_5)/5
- partB_weighted: ROUND(partB_raw*0.3, 2)
- final_score: ((partA_weighted+partB_weighted)*100)/5

[ App 305: PMS Section Manager ]
- total_score: mbo_point_obj1+mbo_point_obj2+mbo_point_obj3+mbo_point_obj4
- partA_weighted: ROUND((total_score*50)/100, 2)
- partB_raw: (competency_1+competency_2+competency_3+competency_4+competency_5+competency_6)/6
- partB_weighted: ROUND(partB_raw*0.5, 2)
- final_score: ((partA_weighted+partB_weighted)*100)/5

[ App 307: PMS DGM ]
- partA_weighted: ROUND((total_score*50)/100, 2)
- partB_raw: (comp1+comp2+comp3+comp4+comp5+comp6)/6
- partB_weighted: ROUND(partB_raw*0.5, 2)

[ App 310: PMS Assistant Manager ]
- partA_weighted: ROUND((total_score*50)/100, 2)  <-- NOTE: Kintone uses 50%, Excel template says 60%!
- partB_raw: (comp1+comp2+comp3+comp4+comp5+comp6)/6
- partB_weighted: ROUND(partB_raw*0.5, 2)

[ App 640: PMS GM ]
- partA_weighted: ROUND((total_score*50)/100, 2)
- partB_raw: (comp1+comp2+comp3+comp4+comp5)/5
- partB_weighted: ROUND(partB_raw*0.5, 2)

[ App 715: PMS VP ]
- partA_weighted: ROUND((total_score*50)/100, 2)
- partB_raw: (comp1+comp2+comp3+comp4+comp5)/5
- partB_weighted: ROUND(partB_raw*0.5, 2)

[ App 716: Japan Staff ]
- partA_weighted: ROUND((total_score*70)/100, 2)
- partB_raw: (comp1+comp2+comp3+comp4+comp5)/5
- partB_weighted: ROUND(partB_raw*0.3, 2)
- final_score: ((partA_weighted+partB_weighted)*100)/5
```
