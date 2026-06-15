import './navBar.css'
import './font.css'

function NavBar() {
  return (
    <>
      <nav className='high_navBar'>
        <img className='logo_navBar' src="logo" alt="#" />
        <p className='text_navBar'>DashBoard</p>
        <a href="profile.html"><button className='profile_btn'>Профиль</button></a>
      </nav>
      <aside className='asideBar'>
        <button className='btn'>1</button>
        <button className='btn'>2</button>
        <button className='btn'>3</button>
      </aside>
    </>
  )
}

export default NavBar
