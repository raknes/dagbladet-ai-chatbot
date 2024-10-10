import Link from 'next/link';

import {
  IconDagbladet,
  IconNextChat
} from '@/components/ui/icons';
import { AIDropdown } from './model-selector';

// import * as React from 'react'

// import { UserMenu } from '@/components/user-menu'
import { auth } from '@/auth';
import { Session } from '@/lib/types';
// import { ChatHistory } from './chat-history'
// import { SidebarMobile } from './sidebar-mobile'
// import { SidebarToggle } from './sidebar-toggle'



async function UserOrLogin() {
  const session = (await auth()) as Session
  return (
    // <>
    //   {session?.user ? (
    //     <>
    //       <SidebarMobile>
    //         <ChatHistory userId={session.user.id} />
    //       </SidebarMobile>
    //       <SidebarToggle />
    //     </>
    //   ) : (
        <Link href="/new" rel="nofollow">
          <IconNextChat className="size-6 mr-2 dark:hidden" inverted />
          <IconNextChat className="hidden size-6 mr-2 dark:block" />
        </Link>
    //   )}
    //   <div className="flex items-center">
    //     <IconSeparator className="size-6 text-muted-foreground/50" />
    //     {session?.user ? (
    //       <UserMenu user={session.user} />
    //     ) : null }
    //   </div>
    // </>
  )
}

export function Header() {
  const handleModelChange = async (model: string) => {
    "use server"
    const session = (await auth()) as Session;
    const values = model.split(':');
    session.aiProvider = values[0] ?? 'Anthropic';
    session.aiModel = values[1] ?? 'claude-3-5-sonnet-20240620';
  };

  return (
    <header className="sticky z-50 flex items-center justify-between w-full h-20 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        {/* <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense> */}
        <div style={{ width: '100px'}}><IconDagbladet /></div>
        <div className="flex items-center gap-4"></div>
        <div className="flex items-center gap-4">
          {/* <AIDropdown handleModelChange={handleModelChange} /> */}
          <AIDropdown />
        </div>
      </div>
    </header>
  )
}
