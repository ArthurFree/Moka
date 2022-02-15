import React from 'react';
import { BrowserRouter, Routes, Route  } from 'react-router-dom';
import Layout from './Layout/index';
import Editor from './Editor/index';
import './index.scss';

const App = (): React.ReactElement => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="/edit" element={<Editor />} />
            </Route>
            <Route path="/editor" element={<Editor />} />
        </Routes>
    </BrowserRouter>
);

export default App;
