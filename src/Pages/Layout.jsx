import { Outlet } from "react-router-dom";
import SideBar from "../Components/SideBar";
// import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";

function Layout() {
    return (
        <>
            <main style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
                <SideBar />

                <div style={{ flex: 1, overflow: "scroll" }}>
                    {/* <NavBar /> */}

                    <div style={{ padding: "25px" }}>
                        <Outlet />
                    </div>

                    <Footer />
                </div>
            </main>

        </>
    )
}

export default Layout