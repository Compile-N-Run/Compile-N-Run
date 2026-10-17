import java.util.*;

class Main {
    public static void main(String[] args) {
        Object[][] cases = {
            {"19216811", List.of("1.92.168.11", "19.2.168.11", "19.21.68.11", "19.216.8.11", "19.216.81.1",
                "192.1.68.11", "192.16.8.11", "192.16.81.1", "192.168.1.1")},
            {"1020304", List.of("10.20.30.4", "10.203.0.4", "102.0.30.4")},
            {"0000", List.of("0.0.0.0")},
            {"00000", List.of()}, // a part would need a leading zero
            {"10000", List.of("10.0.0.0")},
            {"1111", List.of("1.1.1.1")},
            {"123", List.of()}, // too short
            {"1234567890123", List.of()}, // too long
            {"255255255255", List.of("255.255.255.255")},
            {"256256256256", List.of()},
            {"99999999", List.of("99.99.99.99")},
            {"11011", List.of("1.1.0.11", "1.10.1.1", "11.0.1.1")},
            {"2552550", List.of("2.55.25.50", "2.55.255.0", "25.5.25.50", "25.5.255.0", "25.52.5.50", "25.52.55.0",
                "255.2.5.50", "255.2.55.0", "255.25.5.0")},
            {"172160254", List.of("1.72.160.254", "17.2.160.254", "17.21.60.254", "17.216.0.254", "172.1.60.254",
                "172.16.0.254", "172.160.2.54", "172.160.25.4")},
            {"1".repeat(20), List.of()}}; // the longest allowed input: pruning must not explore it digit by digit
        for (Object[] c : cases) {
            List<String> got = new ArrayList<>(new Solution().restoreIpAddresses((String) c[0]));
            Collections.sort(got);
            Check.eq(got, c[1], (String) c[0]);
        }
        Check.done();
    }
}
