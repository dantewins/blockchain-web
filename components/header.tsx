import { Button } from "@/components/ui/button"
import Link from "next/link"

import React from 'react'

const Header = () => {
    return (
        <header className="container mx-auto py-2 top-0 w-full">
            <div className="flex h-14 items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Link href="/">
                        <span className="text-xl font-semibold">Blockchain</span>
                    </Link>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/settings">Settings</a>
                    </Button>
                    <Button variant="default" size="sm" asChild>
                        <a href="/transaction">Create transaction</a>
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default Header