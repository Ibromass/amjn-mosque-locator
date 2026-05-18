import { createContext, useState } from "react";

export const UserContext = createContext()

export const AuthContext = ({ children }) => {
    const [AdminData, setAdminData] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("adminUser"))
        } catch {
            return null
        }
    })

    const setUser = (data) => {
        localStorage.setItem("adminUser", JSON.stringify(data))
        setAdminData(data)
        localStorage.setItem('adminToken', JSON.stringify(data.token || data.accessToken || ''));
    }

    const logout = () => {
    let confirm = window.confirm("Are you sure you wnat to logout?")
    if (!confirm) {
      return
    }
    setAdminData(null)
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
  }

    return <UserContext.Provider value={{AdminData, setUser, logout}}>
        {children}
    </UserContext.Provider>
}
