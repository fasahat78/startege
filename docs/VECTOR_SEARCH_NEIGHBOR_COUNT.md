# Approximate Neighbors Count - Explanation

**Field**: Approximate neighbors count  
**Purpose**: Configures how many similar vectors the Tree-AH algorithm considers during search

---

## 🎯 What It Means

**Approximate neighbors count** tells the Vector Search algorithm how many similar vectors to consider when searching. It's a balance between:

- **Accuracy**: Higher count = more accurate results (but slower)
- **Speed**: Lower count = faster queries (but less accurate)

---

## 📊 Recommended Values

### For Startegizer RAG (Our Use Case)

**Recommended**: `10` or `20`

**Reasoning**:
- We're retrieving top 3-5 results per query
- Tree-AH algorithm needs to consider more candidates to find the best matches
- `10-20` provides good accuracy without being too slow
- Standard practice: Set this 2-4x your expected top-K results

### General Guidelines

| Use Case | Top-K Results | Recommended Neighbor Count |
|----------|---------------|---------------------------|
| Small dataset (< 10K vectors) | 3-5 | 10-20 |
| Medium dataset (10K-100K) | 5-10 | 20-40 |
| Large dataset (> 100K) | 10-20 | 40-80 |

---

## 🔧 For Your Index

**Recommended Value**: `10`

**Why**:
- We're retrieving top 3-5 results (marketScanTopK: 3, standardsTopK: 3)
- Starting with smaller dataset (articles + standards)
- Good balance of speed and accuracy
- Can increase later if needed

---

## ⚙️ How It Works

1. **Query comes in** → Generate embedding
2. **Tree-AH algorithm** searches index
3. **Considers ~10 neighbors** (if you set it to 10)
4. **Ranks them** by similarity
5. **Returns top-K** (3-5 in our case)

**Higher count** = Algorithm looks at more candidates = Better chance of finding the best matches

---

## 💡 Tips

- **Start conservative**: Begin with `10`, test, then increase if needed
- **Monitor performance**: If queries are slow, reduce; if results are poor, increase
- **Consider dataset size**: Larger datasets may need higher counts
- **Can be adjusted**: You can update this later if needed

---

## ✅ For Your Form

**Enter**: `10`

This is a good starting point for Startegizer's RAG system!

