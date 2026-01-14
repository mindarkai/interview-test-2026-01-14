export interface MainLayoutProps
{
    children:any;
}

export function MainLayout({
    children
}:MainLayoutProps){

    return (
        <div>
            <nav>
                Nav
            </nav>
            {children}
        </div>
    )

}