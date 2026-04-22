import { useContext, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { UserContext } from "../Context/UserContext"

function ProtectedRoute({ children }) {
    const { AdminData } = useContext(UserContext)

    if (!AdminData) {
        return <Navigate to="/login" />
    }

    return children

}

export default ProtectedRoute