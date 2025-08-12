import { Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/navbar";

// Import your pages (create these files)
import { Home } from "@/pages/home";
import { Landing } from "@/components/landing";
import { Settings } from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { DepositBTC } from "@/pages/deposit-btc";
import { BorrowUSDC } from "@/pages/borrow-usdc";
import { RepayLoan } from "@/pages/repay-loan";
import { AccountOverview } from "@/pages/account-overview";
import { Layout } from "@/components/layout";
import { Asset } from "@/pages/asset";

function App() {
  return (
    <div className="flex flex-col min-h-screen p-4">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="home" element={<Home />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/deposit" element={<DepositBTC />} />
            <Route path="/borrow" element={<BorrowUSDC />} />
            <Route path="/repay" element={<RepayLoan />} />
            <Route path="/account" element={<AccountOverview />} />
            <Route path="/asset" element={<Asset />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
