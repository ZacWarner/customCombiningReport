import './navbar.css';

export default function Navbar() {

    return (
        <nav className="appNavbar">
            <div className='appNavName mx-4'>
                <h2 className='appNameText'>Income Statements</h2>
            </div >
            <div className='appNavTab mx-4'>
                <a className='appNavButtons' href='/incomestatements-Evolution/reports/combining.cfm'>
                    COMBINING
                </a>
            </div>
            <div className='appNavTab mx-4'>
                <a className='appNavButtons' href='/incomestatements-Evolution/reports/ptd-ytd.cfm'>
                    PTD-YTD
                </a>
            </div>
            <div className='appNavTab mx-4'>
                <a className='appNavButtons' href='/incomestatements-Evolution/reports/trailing12.cfm'>
                    TRAILING 12
                </a>
            </div>
            <div className='appNavTab mx-4'>
                <a className='appNavButtons' href='/incomestatements-Evolution/reports/forecast.cfm'>
                    FORECAST VS PLAN
                </a>
            </div>
            <div className='appNavTab mx-4'>
                <a className='appNavButtons appNavTapSelect' href='#'>
                    CUSTOM COMBINING
                </a>
            </div>
        </nav>
    )
}