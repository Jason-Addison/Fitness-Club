import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Member from './components/Member';
import Trainer from './components/Trainer';
import Admin from './components/Admin';
import Header from "./components/Header";
import MemberSearch from "./components/MemberSearch";
import MemberProfile from "./components/MemberProfile";

function App() {
    return (
    <Router>
        <Header />
        <Routes>
            <Route path="/member" element={<Member />} />
            <Route path="/trainer" element={<Trainer />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/membersearch" element={<MemberSearch />} />
            <Route path="/memberprofile/:memberId" element={<MemberProfile/>} />
        </Routes>
    </Router>
    );
}

export default App;
