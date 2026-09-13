import AppRouter from './app/router'
import AuthProvider from './auth/AuthProvider'

function App() {

  return (
    // AuthProvider包在最外面，一直不会卸载
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
