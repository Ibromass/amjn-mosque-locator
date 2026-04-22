import LoginPage from './Pages/LoginPage';
import AdminProfile from './Pages/AdminProfile';
import MapView from './Pages/MapView';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import MosqueDetail from './Pages/MosqueDetail';
import AddMosque from './Pages/AddMosque';
import ProtectedRoute from './Utils/ProtectedRoute';
import Layout from './Pages/Layout';
import Favourites from './Pages/Favourites';
import { AuthContext } from './Context/UserContext';
import { useState } from 'react';
import EditMosque from './Pages/EditMosque';
import Favourite from './Context/Favouritecontext';
import Favouritecontext from './Context/Favouritecontext';

function App() {

  const [favouriteMosques, setFavouriteMosques] = useState([])


  return (

    <AuthContext>
      <Favouritecontext.Provider value={{ favouriteMosques, setFavouriteMosques }}>
        <BrowserRouter>


          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/map-view" element={<MapView />} />
              <Route path="/m/:id" element={<MosqueDetail />} />
              <Route path="/favourites" element={<Favourites />} />


              <Route path="/addmosque" element={<ProtectedRoute><AddMosque /></ProtectedRoute>} />
              <Route path="edit/:id" element={<ProtectedRoute><EditMosque /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute>< AdminProfile /></ProtectedRoute>} />
            </Route>

          </Routes>

        </BrowserRouter >
      </Favouritecontext.Provider>
    </AuthContext>

  )
}

export default App;