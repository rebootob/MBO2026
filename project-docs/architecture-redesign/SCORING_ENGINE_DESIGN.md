# Configuration-Driven Scoring Engine Design

> **Document Status:** Active (Confirmed Standard)  
> **Last Updated:** 2026-08-23  

---

## 1. Decoupled Mathematical Architecture with Dynamic Competency Filtering

The Scoring Engine eliminates all position-specific `if/else` hardcoding and dynamically respects the `Included_In_Score` flag per competency item (excluding COCE from the divisor and sum automatically):

```javascript
export class ScoringEngine {
  static calculateEvaluation(record, profileSnapshot) {
    const partAWeight = profileSnapshot.Part_A_Weight_Percent; // e.g. 70 or 50
    const partBWeight = profileSnapshot.Part_B_Weight_Percent; // e.g. 30 or 50
    
    // 1. Calculate Part A Raw Score (Difficulty x Achievement Matrix)
    const objCount = parseInt(record.Objective_Count?.value || '4', 10);
    let partARaw = 0;
    for (let i = 1; i <= objCount; i++) {
      const weight = parseFloat(record[`Weight_${i}`]?.value || '0');
      const achieve = parseFloat(record[`Manager_Achievement_${i}`]?.value || '0');
      const diff = parseFloat(record[`Difficulty_${i}`]?.value || '0');
      
      const score = ScoringMatrix.lookup(diff, achieve); // Standard 4x5 table
      const point = (weight * score) / 100;
      partARaw += point;
    }

    // 2. Calculate Part B Raw Score (Filtered by Included_In_Score)
    // COCE has Included_In_Score = false, so it is filtered out of the average automatically!
    const scoredCompetencies = (profileSnapshot.Competencies || [])
      .filter(c => c.Included_In_Score === true || c.Included_In_Score === 'Yes');
    
    let sumScoredRatings = 0;
    scoredCompetencies.forEach(c => {
      const rating = parseFloat(record[`Competency_Rating_${c.Sequence}`]?.value || '0');
      sumScoredRatings += rating;
    });

    const divisor = scoredCompetencies.length > 0 ? scoredCompetencies.length : 1;
    const partBRaw = sumScoredRatings / divisor;

    // 3. Compute Final Weighted Scores
    const partAWeighted = Math.round(((partARaw * partAWeight) / 100) * 100) / 100;
    const partBWeighted = Math.round(((partBRaw * partBWeight) / 100) * 100) / 100;
    const finalScore = Math.round((((partAWeighted + partBWeighted) * 100) / 5) * 100) / 100;

    return { partARaw, partBRaw, partAWeighted, partBWeighted, finalScore };
  }
}
```
