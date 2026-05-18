---
title: "天梯赛普及赛编程题题解"
description: "整理天梯赛普及赛编程题的题解与代码实现。"
publishDate: "2026-03-14"
tags: ["算法", "题解", "天梯赛"]
draft: false
---
# 天梯赛普及赛编程题题解

## 1

```c++
#include <bits/stdc++.h>
using namespace std;
using i64 = long long;

void solve ()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        vector <i64> v;
        v.reserve(10001);
        i64 t;
        while (cin >> t) {
            if (t == -1) break;
            v.push_back(t);
        } 
        int m = v.size();
        bool ok = false;
        i64 ans1, ans2, ans3;
        unordered_map <i64, vector <int> > mp;
        for (int i = 0; i < m; i++) {
            if (i == m - 1 || i == m - 2) continue;
            mp[v[i]].push_back(i);
        }

        vector <array <i64, 4> > ans;
        unordered_map <int, int> mpp;
        mpp[v[m - 1]] = true;
        mpp[v[m - 2]] = true;
        for (int i = 0; i < m - 2; i++) {
            if (mpp[v[i]]) continue;
            i64 a = v[i + 1], b = v[i + 2];
            bool found = true;
            int cnt = 0;
            int pos = 0;
            for (auto x : mp[v[i]]) {
                i64 c = v[x + 1], d = v[x + 2];
                if (c != a || d != b) {
                    found = false;
                    break;
                }
                cnt++;
                if (cnt == 2) {
                    pos = x;
                }
                // cout << v[i] << ' ' << pos << '\n';
            }
            if (found && cnt >= 2) {
                ok = true;
                ans.push_back({pos, v[i], a, b});
            }
            mpp[v[i]] = true;
        }

        if (ans.size()) sort(ans.begin(), ans.end());
        if (ans.size()) {
            cout << ans[0][1] << ' ' << ans[0][2] << ' ' << ans[0][3] << '\n';
        }else {
            cout << "NONE\n";
        }
    }
}

int main ()
{
    ios::sync_with_stdio(false);
    cin.tie(0);
    int _ = 1;
    // cin >> _;
    while (_--) {
        solve();
    }
    return 0;
}
```