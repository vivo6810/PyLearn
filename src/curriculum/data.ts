import type { Track } from '../types'

// Data Analysis track (wave 5) — structured from Bernd Klein's
// "Data Analysis: Numpy, Matplotlib and Pandas" + StackAbuse data-viz preview.
// numpy/pandas/matplotlib run right in the browser via Pyodide; matplotlib
// figures are captured and rendered inline.

export const data: Track = {
  id: 'data',
  title: 'Data Analysis',
  blurb: 'NumPy arrays, Matplotlib plots and Pandas DataFrames — the foundation of data science in Python.',
  icon: 'chart',
  accent: '#6a7a5c',
  modules: [
    {
      id: 'd1',
      title: 'Module 1 · NumPy',
      summary: 'Fast, vectorized numerical computing: the array library every data tool builds on.',
      lessons: [
        {
          id: 'd1-1',
          title: 'Arrays: creation, dtypes, vectorization',
          minutes: 85,
          source: 'klein',
          sourceRef: 'Klein — Numpy Tutorial, Creating Arrays, dtype',
          objectives: ['Create arrays many ways', 'Inspect shape & dtype', 'Replace loops with vectorized ops'],
          sections: [
            {
              h: 'Why NumPy exists',
              md: `Python lists are flexible but slow for math: \`[x*9/5+32 for x in temps]\` loops in Python bytecode, item by item. A NumPy array is a **contiguous block of same-typed numbers**, so operations run in compiled C over the whole block at once — **vectorization**. Typically 10–100× faster, and the code reads like the math:\n\n\`\`\`python\nimport numpy as np\n\nC = np.array([20.1, 20.8, 21.9, 22.5])\nF = C * 9 / 5 + 32        # one line, no loop\n\`\`\``,
            },
            {
              h: 'Creating arrays',
              md: `\`\`\`python\nnp.array([1, 2, 3])        # from a list\nnp.zeros((2, 3))           # 2×3 of 0.0\nnp.ones(4)\nnp.arange(0, 10, 2)        # like range: 0,2,4,6,8\nnp.linspace(0, 1, 5)       # 5 evenly spaced: includes endpoint\nnp.random.default_rng(42).integers(0, 10, size=5)\n\`\`\``,
            },
            {
              h: 'shape & dtype',
              md: `Every array has \`.shape\` (dimensions, e.g. \`(2, 3)\` = 2 rows × 3 cols), \`.ndim\`, and \`.dtype\` (\`int64\`, \`float64\`, …). Unlike lists, one array holds **one** dtype — mixing ints and floats coerces everything to float. \`.reshape(r, c)\` re-view the same data in a new shape.`,
            },
            {
              h: 'The rules of vectorization',
              md: `Operations apply **elementwise**: \`A + B\` adds matching positions; \`A * 2\` doubles every element (no matrix multiplication — that's \`@\`); comparisons produce boolean arrays. If you write \`for\` over an ndarray, pause — there is almost always a vectorized one-liner.`,
            },
          ],
          examples: [
            {
              caption: 'Vectorized Celsius → Fahrenheit',
              code: `import numpy as np

cvalues = [20.1, 20.8, 21.9, 22.5, 22.7, 21.8]
C = np.array(cvalues)
print(C.dtype, C.shape)
print(C * 9 / 5 + 32)
print(np.round(C.mean(), 2))`,
              expected: 'float64 (6,)\n[68.18 69.44 71.42 72.5  72.86 71.24]\n21.63',
            },
            {
              caption: 'Builders & reshaping',
              code: `import numpy as np

a = np.arange(1, 7)
M = a.reshape(2, 3)
print(M)
print("shape:", M.shape, "ndim:", M.ndim)
print(np.linspace(0, 1, 5))
print(np.zeros((2, 2)))`,
              expected: '[[1 2 3]\n [4 5 6]]\nshape: (2, 3) ndim: 2\n[0.   0.25 0.5  0.75 1.  ]\n[[0. 0.]\n [0. 0.]]',
            },
          ],
          quiz: [
            {
              q: 'np.arange(0, 10, 3) yields…',
              choices: ['[0, 3, 6, 9]', '[0, 3, 6, 9, 10]', '[3, 6, 9]', '[0, 1, 3]'],
              answer: 0,
              explain: 'Like range: start inclusive, stop exclusive, step 3.',
            },
            {
              q: 'np.linspace(0, 1, 5) gives how many numbers?',
              choices: ['4', '5', '6', '2'],
              answer: 1,
              explain: 'linspace(count) — 5 evenly spaced including both endpoints.',
            },
            {
              q: 'A * 2 on an array does what?',
              choices: ['Matrix multiplication', 'Elementwise doubling', 'Repeats the array', 'Error'],
              answer: 1,
              explain: 'Operators act elementwise; matrix multiply is the @ operator.',
            },
            {
              q: 'np.array([1, 2, 3.0]).dtype is…',
              choices: ['int64', 'float64', 'mixed', 'object'],
              answer: 1,
              explain: 'One dtype per array: ints coerce up to the float.',
            },
          ],
          exercises: [
            {
              title: 'Normalize to percent',
              brief:
                'Vectorized only (no for loops): from `raw` scores, compute `percents` scaled so the maximum becomes 100, rounded to 1 decimal.',
              starter: `import numpy as np

raw = np.array([45, 78, 90, 62])

percents = np.zeros(4)  # replace this with your vectorized computation

print(percents)`,
              tests: `
import numpy as _np
_expected = _np.round(_np.array([45, 78, 90, 62]) / 90 * 100, 1)
assert _np.allclose(percents, _expected), f'got {percents!r}'
assert 'for ' not in _user_code, 'vectorize — no loops!'
`,
              hint: 'raw / raw.max() * 100, then np.round(..., 1)',
            },
          ],
        },
        {
          id: 'd1-2',
          title: 'Slicing, masks & aggregations',
          minutes: 85,
          source: 'klein',
          sourceRef: 'Klein — Boolean Indexing, Numerical Operations',
          objectives: ['Slice multi-dimensional arrays', 'Filter with boolean masks', 'Aggregate along axes'],
          sections: [
            {
              h: 'Slicing in 2-D',
              md: `\`\`\`python\nM[1, 2]      # row 1, col 2\nM[0]         # first row\nM[:, 1]      # every row, column 1\nM[::2, ::-1] # every other row, columns reversed\n\`\`\`\n\nBasic slices are **views**, not copies — writing to a view changes the original. Use \`.copy()\` when you need independence.`,
            },
            {
              h: 'Boolean masks — the superpower',
              md: `\`\`\`python\nC = np.array([20.1, 25.3, 18.9, 30.2])\nhot = C > 22          # [False, True, False, True]\nC[hot]                # array([25.3, 30.2])\nC[C > 22] = 0         # modify in place!\n\`\`\`\n\nA comparison makes a boolean array; indexing with it **selects matching elements**. Chains combine with \`&\` \`|\` (with parentheses!) — \`C[(C > 20) & (C < 25)]\`. This one idea powers most real data filtering you'll ever write.`,
            },
            {
              h: 'Aggregation & axis',
              md: `\`.sum() .mean() .max() .min() .std()\` collapse an array to a number. On 2-D arrays, \`axis=0\` collapses **down the rows** (one result per column); \`axis=1\` across each row. \`np.argmax\` returns the index of the max.`,
            },
          ],
          examples: [
            {
              caption: 'Masks in action',
              code: `import numpy as np

rng = np.random.default_rng(7)
temps = rng.integers(15, 35, size=10)
print(temps)
print(temps[temps > 27])          # hot days
print("hot days:", (temps > 27).sum())
temps[temps > 30] = 30            # cap outliers
print(temps)`,
              expected: '[17 20 27 30 29 32 33 34 31 15]\n[30 29 32 33 34 31]\nhot days: 6\n[17 20 27 30 29 30 30 30 30 15]',
            },
            {
              caption: '2-D aggregation',
              code: `import numpy as np

M = np.arange(1, 7).reshape(2, 3)
print(M)
print("col sums:", M.sum(axis=0))
print("row means:", M.mean(axis=1))
print("grand max:", M.max())`,
              expected: '[[1 2 3]\n [4 5 6]]\ncol sums: [5 7 9]\nrow means: [2. 5.]\ngrand max: 6',
            },
          ],
          quiz: [
            {
              q: 'M[:, 0] selects…',
              choices: ['Row 0', 'Column 0', 'Element (0,0)', 'The whole array'],
              answer: 1,
              explain: 'The full slice : means "all rows"; 0 picks column 0.',
            },
            {
              q: 'C[C > 10] = 0 does what?',
              choices: ['Errors', 'Sets elements above 10 to zero', 'Creates a copy', 'Counts elements'],
              answer: 1,
              explain: 'Masked assignment writes through to the selected positions.',
            },
            {
              q: 'Combine two masks with AND using…',
              choices: ['and', '&&', '&', '+'],
              answer: 2,
              explain: 'NumPy uses & and | with parentheses around each comparison.',
            },
            {
              q: 'M.sum(axis=0) on a 2×3 matrix returns…',
              choices: ['A scalar', '3 numbers (per column)', '2 numbers (per row)', 'An error'],
              answer: 1,
              explain: 'axis=0 collapses rows, leaving one value per column.',
            },
            {
              q: 'a.shape for np.zeros((4, 3)) is…',
              choices: ['(3, 4)', '(4, 3)', '12', '(4,)'],
              answer: 1,
              explain: 'shape is (rows, columns) — 4 rows of 3.',
            },
            {
              q: 'Why vectorize instead of a Python for-loop?',
              choices: [
                'Shorter syntax only',
                'Operations run in optimized C over whole arrays',
                'Loops are illegal with arrays',
                'It uses less memory always',
              ],
              answer: 1,
              explain: 'Vectorized ops push the loop into compiled C — orders of magnitude faster.',
            },
          ],
          exercises: [
            {
              title: 'Detect outliers',
              brief:
                'Vectorized: set `outliers` to the values of `data` more than 2 standard deviations from the mean (use data.std()), and cap them by assigning the mean into `data` for those positions.',
              starter: `import numpy as np

data = np.array([50., 52., 49., 51., 120., 48., 53.])

outliers = np.array([])   # values beyond 2*std from mean

# ...then cap outliers in data to the mean

print(outliers)
print(data)`,
              tests: `
import numpy as _np
_d = _np.array([50., 52., 49., 51., 120., 48., 53.])
_mask = _np.abs(_d - _d.mean()) > 2 * _d.std()
assert _np.allclose(outliers, _d[_mask]), f'outliers got {outliers!r}'
assert _np.allclose(data, _np.array([50., 52., 49., 51., 50.52, 48., 53.])), f'data got {data!r}'
assert 'for ' not in _user_code, 'no loops!'
`,
              hint: 'mean = data.mean(); mask = np.abs(data - mean) > 2 * data.std(); outliers = data[mask]; data[mask] = mean.',
            },
          ],
        },
      ],
    },
    {
      id: 'd2',
      title: 'Module 2 · Matplotlib & Pandas',
      summary: 'Turn numbers into pictures, and tables into insights.',
      lessons: [
        {
          id: 'd2-1',
          title: 'Plotting with Matplotlib',
          minutes: 85,
          source: 'stackabuse',
          sourceRef: 'StackAbuse ch. 4 + Klein Matplotlib Tutorial',
          objectives: ['Draw line/bar/scatter/histogram plots', 'Label and style plots', 'Understand figure vs axes'],
          sections: [
            {
              h: 'Your first plot',
              md: `\`\`\`python\nimport matplotlib.pyplot as plt\n\nx = [1, 2, 3, 4]\ny = [1, 4, 9, 16]\nplt.plot(x, y, marker="o")\nplt.title("Squares")\nplt.xlabel("n"); plt.ylabel("n²")\nplt.grid(True)\nplt.show()\n\`\`\`\n\nIn PyLearn, \`plt.show()\` renders the figure right below your code. **Pyplot** is the MATLAB-style convenience layer; underneath, every plot is a **Figure** (the canvas) containing **Axes** (the actual chart).`,
            },
            {
              h: 'The gallery of chart types',
              md: `\`\`\`python\nplt.bar(categories, heights)     # comparisons\nplt.scatter(xs, ys)              # relationships\nplt.hist(values, bins=10)        # distributions\nplt.pie(sizes, labels=names)     # proportions (use sparingly!)\n\`\`\`\n\nChoosing the right type is half of data visualization: bar for comparing categories, scatter for correlation, histogram for distribution, line for time.`,
            },
            {
              h: 'Style communicates',
              md: `\`color\`, \`linestyle\`, \`marker\`, \`alpha\` (transparency), \`label=\` + \`plt.legend()\`. Multiple \`plt.plot\` calls draw on the same axes. Small touches — axis labels, a title, legible ticks — are the difference between a chart and an *answer* (StackAbuse's whole anatomy chapter is about this).`,
            },
          ],
          examples: [
            {
              caption: 'Temperature line chart',
              code: `import numpy as np
import matplotlib.pyplot as plt

days = np.arange(1, 8)
temps = np.array([21, 23, 22, 25, 27, 26, 24])

plt.plot(days, temps, marker="o", color="tomato", label="temp")
plt.axhline(temps.mean(), linestyle="--", color="gray", label="mean")
plt.title("Week temperatures")
plt.xlabel("day"); plt.ylabel("°C")
plt.legend()
plt.show()`,
              expected: '(line chart with a dashed mean line)',
            },
            {
              caption: 'Histogram of random data',
              code: `import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(1)
rolls = rng.integers(1, 7, size=1000)

plt.hist(rolls, bins=[0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5], color="mediumseagreen")
plt.title("1000 dice rolls")
plt.xlabel("face"); plt.ylabel("count")
plt.show()`,
              expected: '(six roughly equal bars ~166 each)',
            },
          ],
          quiz: [
            {
              q: 'plt.plot() twice before show() gives…',
              choices: ['Two windows', 'Two lines on one chart', 'An error', 'The second replaces the first'],
              answer: 1,
              explain: 'Consecutive plot calls draw onto the same axes.',
            },
            {
              q: 'Which chart for the distribution of heights?',
              choices: ['Pie', 'Histogram', 'Bar', 'Line'],
              answer: 1,
              explain: 'Histograms show how values spread across bins.',
            },
            {
              q: 'plt.hist(data, bins=10) means…',
              choices: ['10 bars max', 'Split data into 10 bins', 'Show 10 samples', 'y-axis 0-10'],
              answer: 1,
              explain: 'bins sets how many intervals the value range is divided into.',
            },
            {
              q: 'label= + plt.legend() do what together?',
              choices: ['Nothing', 'Name lines in a legend box', 'Save the file', 'Change colors'],
              answer: 1,
              explain: 'label names each series; legend displays them.',
            },
            {
              q: 'plt.savefig("c.png") should come…',
              choices: ['Before plt.show()', 'After plt.show()', 'Instead of a title', 'Twice'],
              answer: 0,
              explain: 'show() clears the figure buffer in many backends — save before showing.',
            },
          ],
          exercises: [
            {
              title: 'Publish a complete chart',
              brief:
                'Plot `months` vs `sales` as a bar chart, colored "slateblue", with title "2026 Sales", x-label "month", y-label "units" — and plt.show(). Chart literacy is in the details.',
              starter: `import matplotlib.pyplot as plt

months = ["J", "F", "M", "A", "M", "J"]
sales = [120, 135, 128, 160, 175, 190]

# your bar chart

plt.show()`,
              tests: `
code = _user_code
assert 'plt.bar' in code or 'plt.bar(' in code, 'use plt.bar'
assert "slateblue" in code, 'color the bars slateblue'
assert 'plt.title' in code, 'add a title'
assert 'xlabel' in code and 'ylabel' in code, 'label both axes'
`,
              hint: 'plt.bar(months, sales, color="slateblue") then plt.title(...), plt.xlabel("month"), plt.ylabel("units").',
            },
          ],
        },
        {
          id: 'd2-2',
          title: 'Pandas: Series & DataFrames',
          minutes: 90,
          source: 'klein',
          sourceRef: 'Klein — Introduction into Pandas, Data Structures, Accessing values',
          objectives: ['Build Series and DataFrames', 'Select rows and columns', 'Filter with boolean conditions'],
          sections: [
            {
              h: 'The spreadsheet of Python',
              md: `A **Series** is a labeled 1-D array (NumPy + an index); a **DataFrame** is a table of Series sharing one index — rows *and* columns have names. Excel/SQL thinking, but reproducible in code:\n\n\`\`\`python\nimport pandas as pd\n\ndf = pd.DataFrame({\n    "city": ["Lisbon", "Oslo", "Cairo"],\n    "pop": [545_000, 709_000, 9_540_000],\n})\n\`\`\``,
            },
            {
              h: 'Looking at data',
              md: `\`df.head()\` first rows, \`df.info()\` dtypes & nulls, \`df.describe()\` numeric summary, \`df.shape\`. Always begin by looking — 80% of data work is knowing your data.`,
            },
            {
              h: 'Selecting',
              md: `- \`df["pop"]\` — one column (a Series)\n- \`df[["city", "pop"]]\` — several columns (double brackets!)\n- \`df.loc[1]\` — row **by label**; \`df.iloc[0]\` — row **by position**\n- \`df[df["pop"] > 600000]\` — boolean filtering, same masks as NumPy`,
            },
            {
              h: 'Transforming',
              md: `Columns derive like NumPy: \`df["pop_m"] = df["pop"] / 1e6\`. Sort with \`df.sort_values("pop", ascending=False)\`. A taste of the next lesson: \`df.groupby("city")["pop"].sum()\` aggregates — Klein's groupby chapter expands this into full split-apply-combine.`,
            },
          ],
          examples: [
            {
              caption: 'Build, inspect, filter',
              code: `import pandas as pd

df = pd.DataFrame({
    "city": ["Lisbon", "Oslo", "Cairo", "Tokyo"],
    "pop": [545000, 709000, 9540000, 13960000],
    "continent": ["Europe", "Europe", "Africa", "Asia"],
})
print(df.head(2))
print()
print(df["pop"].mean())
big = df[df["pop"] > 1_000_000]
print(big["city"].tolist())`,
              expected: '    city     pop continent\n0  Lisbon  545000    Europe\n1    Oslo  709000    Europe\n\n6181000.0\n[Cairo, Tokyo]',
            },
            {
              caption: 'Derive, sort, group',
              code: `import pandas as pd

df = pd.DataFrame({
    "city": ["Oslo", "Cairo", "Tokyo"],
    "pop": [709000, 9540000, 13960000],
})
df["pop_m"] = df["pop"] / 1e6
print(df.sort_values("pop", ascending=False)["city"].tolist())
print(df["pop_m"].round(1).tolist())`,
              expected: '[Tokyo, Cairo, Oslo]\n[0.7, 9.5, 14.0]',
            },
          ],
          quiz: [
            {
              q: 'df[["a", "b"]] with double brackets returns…',
              choices: ['Two rows', 'A DataFrame with columns a and b', 'A Series', 'An error'],
              answer: 1,
              explain: 'A list of column names selects multiple columns → DataFrame.',
            },
            {
              q: 'df.loc[2] vs df.iloc[2]',
              choices: ['Same', 'loc by label, iloc by position', 'loc by position, iloc by label', 'iloc is invalid'],
              answer: 1,
              explain: 'loc = label-based, iloc = integer position-based.',
            },
            {
              q: 'A Series is…',
              choices: ['A 2-D table', 'A labeled 1-D array', 'A Python list', 'A chart type'],
              answer: 1,
              explain: 'One column of data plus an index; a DataFrame is a table of Series sharing one index.',
            },
            {
              q: 'df[df["age"] > 30] keeps…',
              choices: ['Column age only', 'Rows where age > 30', 'First 30 rows', 'Nothing'],
              answer: 1,
              explain: 'Boolean indexing filters rows by the mask.',
            },
            {
              q: 'What does df.describe() show?',
              choices: ['First rows', 'Dtypes', 'Count/mean/std/min/quartiles/max', 'All data'],
              answer: 2,
              explain: 'A numeric summary of each numeric column.',
            },
          ],
          exercises: [
            {
              title: 'Analyze a mini dataset',
              brief:
                'From the given `df`: set `avg_price` to the mean price, `expensive` to the DataFrame of items costing more than 1000 sorted by price descending, and `total` to the sum of all prices.',
              starter: `import pandas as pd

df = pd.DataFrame({
    "item": ["laptop", "phone", "tablet", "watch", "monitor"],
    "price": [1200, 899, 450, 320, 1100],
})

avg_price = 0
expensive = df
total = 0

print(avg_price, total)
print(expensive["item"].tolist())`,
              tests: `
assert abs(avg_price - 793.8) < 0.01, f'avg was {avg_price}'
assert expensive['item'].tolist() == ['laptop', 'monitor'], f'{expensive["item"].tolist()!r}'
assert total == 3969
assert 'sort_values' in _user_code, 'use sort_values'
`,
              hint: 'avg_price = df["price"].mean(); expensive = df[df["price"] > 1000].sort_values("price", ascending=False); total = df["price"].sum().',
            },
          ],
        },
        {
          id: 'd2-3',
          title: 'Groupby, NaN & real data',
          minutes: 90,
          source: 'klein',
          sourceRef: 'Klein — groupby, Dealing with NaN, Expenses example',
          objectives: ['Split-apply-combine with groupby', 'Handle missing values', 'Clean a messy dataset'],
          sections: [
            {
              h: 'groupby: split → apply → combine',
              md: `\`\`\`python\ndf.groupby("region")["sales"].sum()\ndf.groupby("region").agg(\n    total=("sales", "sum"), avg=("sales", "mean"), n=("sales", "count")\n)\n\`\`\`\n\nOne line replaces a manual loop-per-group. This is the workhorse of every sales/metrics/report query you will write.`,
            },
            {
              h: 'NaN — missing data',
              md: `Real datasets have holes. \`df.isna().sum()\` counts them per column; \`df.dropna()\` discards incomplete rows; \`df.fillna(0)\` fills. Think before filling: mean for symmetric numbers, zero for counts, forward-fill for time series. Klein's NaN chapter drills exactly this judgment.`,
            },
            {
              h: 'The cleaning checklist',
              md: `Every real dataset: ① look (\`info/head/describe\`) ② fix types (dates, numbers stored as text) ③ find duplicates \`df.duplicated()\` ④ handle NaN ⑤ derive columns ⑥ aggregate. You now have every tool for steps ①–⑥ — the capstone exercise runs the full pipeline.`,
            },
          ],
          examples: [
            {
              caption: 'Groupby aggregation',
              code: `import pandas as pd

df = pd.DataFrame({
    "region": ["N", "S", "N", "S", "N"],
    "sales": [120, 80, 200, 95, 60],
})
g = df.groupby("region")["sales"].sum()
print(g)
print(g.idxmax(), "sells most")`,
              expected: 'region\nN    380\nS    175\nName: sales, dtype: int64\nN sells most',
            },
            {
              caption: 'NaN handling',
              code: `import pandas as pd
import numpy as np

df = pd.DataFrame({"score": [90, np.nan, 75, np.nan, 88]})
print(df.isna().sum())
filled = df.fillna(df["score"].mean().round(1))
print(filled["score"].tolist())`,
              expected: 'score    2\ndtype: int64\n[90.0, 84.3, 75.0, 84.3, 88.0]',
            },
          ],
          quiz: [
            {
              q: 'df.groupby("r")["s"].sum() computes…',
              choices: ['Total per row', 'Sum of s per distinct r', 'Grand total', 'Count of rows'],
              answer: 1,
              explain: 'Split by r, sum s within each group, combine into a Series.',
            },
            {
              q: 'df.isna().sum() gives…',
              choices: ['Errors', 'Missing count per column', 'Sum ignoring NaN', 'Column totals'],
              answer: 1,
              explain: 'isna() is a boolean mask; summing it counts Trues per column.',
            },
            {
              q: 'fillna(mean) is risky when…',
              choices: ['Never', 'The column is skewed/outlier-heavy', 'Data is small', 'Column is text'],
              answer: 1,
              explain: 'Outliers drag the mean; median is safer for skewed data.',
            },
            {
              q: 'idxmax() on a groupby Series returns…',
              choices: ['Max value', 'Index (label) of the max', 'First row', 'Sorted index'],
              answer: 1,
              explain: 'It tells you *which group* holds the maximum.',
            },
            {
              q: 'dropna() vs fillna(value): the first…',
              choices: [
                'Replaces missing values, the second deletes rows',
                'Deletes rows with missing values, the second replaces them',
                'Both do the same',
                'Both raise errors on NaN',
              ],
              answer: 1,
              explain: 'dropna removes incomplete rows; fillna substitutes a chosen value for NaN.',
            },
          ],
          exercises: [
            {
              title: 'Full pipeline: sales report',
              brief:
                'Clean the messy `df` (drop rows with NaN), add a `revenue` column = qty × price, then build `by_product` = total revenue per product sorted descending, and `best` = the top product name.',
              starter: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "product": ["A", "B", "A", "C", "B", "A"],
    "qty": [2, 1, 3, np.nan, 2, 1],
    "price": [10.0, 25.0, 10.0, 8.0, 25.0, 10.0],
})

# 1) drop NaN rows  2) revenue = qty * price
# 3) by_product = revenue per product, sorted desc  4) best = top product name

print(by_product)
print(best)`,
              tests: `
import pandas as _pd
assert by_product.index.tolist() == ['A', 'B'], f'{by_product!r}'
assert by_product.tolist() == [60.0, 75.0], f'{by_product.tolist()!r}'
assert best == 'B', f'best was {best!r}'
assert 'groupby' in _user_code and 'dropna' in _user_code, 'use dropna + groupby'
`,
              hint: 'df = df.dropna(); df["revenue"] = df["qty"] * df["price"]; by_product = df.groupby("product")["revenue"].sum().sort_values(ascending=False); best = by_product.idxmax()',
            },
          ],
        },
      ],
    },
  ],
}
