int main() {
    vector<pair<vector<vector<string>>, vector<string>>> cases = {
        {{{"JFK", "LHR"}, {"LHR", "CDG"}, {"CDG", "JFK"}, {"JFK", "AMS"}}, {"JFK", "LHR", "CDG", "JFK", "AMS"}},
        {{{"JFK", "KUL"}, {"JFK", "NRT"}, {"NRT", "JFK"}}, {"JFK", "NRT", "JFK", "KUL"}},
        {{{"JFK", "NRT"}, {"NRT", "JFK"}, {"JFK", "NRT"}}, {"JFK", "NRT", "JFK", "NRT"}},
        {{{"JFK", "ZRH"}}, {"JFK", "ZRH"}},
        {{{"JFK", "SEA"}, {"SEA", "JFK"}}, {"JFK", "SEA", "JFK"}},
        {{{"JFK", "AAA"}, {"AAA", "BBB"}, {"BBB", "AAA"}, {"AAA", "CCC"}}, {"JFK", "AAA", "BBB", "AAA", "CCC"}},
        {{{"SFO", "JFK"}, {"JFK", "SFO"}, {"JFK", "ATL"}, {"ATL", "SFO"}, {"SFO", "ATL"}},
         {"JFK", "ATL", "SFO", "JFK", "SFO", "ATL"}},
        {{{"JFK", "BBB"}, {"BBB", "CCC"}, {"CCC", "BBB"}, {"BBB", "AAA"}, {"AAA", "JFK"}, {"JFK", "DDD"}},
         {"JFK", "BBB", "CCC", "BBB", "AAA", "JFK", "DDD"}},
    };
    // A 300-ticket path given in scrambled order, and 150 out-and-back trips from JFK.
    vector<string> codes = {"JFK"};
    for (int i = 0; i < 300; i++) codes.push_back(string(1, 'A' + i / 26) + string(1, 'A' + i % 26) + "X");
    vector<vector<string>> path, star;
    vector<string> starWant = {"JFK"};
    for (int k = 0; k < 300; k++) path.push_back({codes[(k * 7) % 300], codes[(k * 7) % 300 + 1]});
    for (int i = 0; i < 150; i++) {
        star.push_back({codes[1 + i], "JFK"});
        star.push_back({"JFK", codes[1 + i]});
        starWant.push_back(codes[1 + i]);
        starWant.push_back("JFK");
    }
    cases.push_back({path, codes});
    cases.push_back({star, starWant});
    for (size_t n = 0; n < cases.size(); n++) {
        vector<vector<string>> tickets = cases[n].first;
        check(Solution().findItinerary(tickets), cases[n].second, "case " + to_string(n));
    }
    return failures ? 1 : 0;
}
