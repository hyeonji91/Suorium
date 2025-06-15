import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { RecoilRoot } from "recoil";
import ScrollToTop from "./utils/helpers/ScrollToTop";
import { Fallback } from "./utils/Fallback";

const MainPage = lazy(() => import("./pages/MainPage/MainPage"));
const TranslatePage = lazy(() => import("./pages/TranslatePage/TranslatePage"));
const Login = lazy(() => import("./pages/Auth/Login/Login"));
const SignUp = lazy(() => import("./pages/Auth/SIgnUp/SignUp"));
const LearnPage = lazy(() => import("./pages/LearnPage/LearnPage"))
const LearnDetail = lazy(() => import("./pages/LearnPage/LearnDetail"))




function App() {
  return (
    <RecoilRoot>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/translate" element={<TranslatePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/learn/:id" element={<LearnDetail />} />
          </Routes>
        </Suspense>
      </Router>
    </RecoilRoot>
  );
}

export default App;
