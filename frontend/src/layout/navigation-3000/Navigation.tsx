import './Navigation.scss'

import clsx from 'clsx'
import { useValues } from 'kea'
import { BillingAlertsV2 } from 'lib/components/BillingAlertsV2'
import { CommandBar } from 'lib/components/CommandBar/CommandBar'
import { FlaggedFeature } from 'lib/components/FlaggedFeature'
import { FEATURE_FLAGS } from 'lib/constants'
import { ReactNode } from 'react'
import { SceneConfig } from 'scenes/sceneTypes'

import { navigationLogic } from '../navigation/navigationLogic'
import { ProjectNotice } from '../navigation/ProjectNotice'
import { MinimalNavigation } from './components/MinimalNavigation'
import { Navbar } from './components/Navbar'
import { ProjectTree } from './components/ProjectTree/ProjectTree'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { navigation3000Logic } from './navigationLogic'
import { SidePanel } from './sidepanel/SidePanel'
import { themeLogic } from './themeLogic'

export function Navigation({
    children,
    sceneConfig,
}: {
    children: ReactNode
    sceneConfig: SceneConfig | null
}): JSX.Element {
    const { theme } = useValues(themeLogic)
    const { mobileLayout } = useValues(navigationLogic)
    const { activeNavbarItem, mode } = useValues(navigation3000Logic)

    if (mode !== 'full') {
        return (
            // eslint-disable-next-line react/forbid-dom-props
            <div className="Navigation3000 flex-col" style={theme?.mainStyle}>
                {mode === 'minimal' ? <MinimalNavigation /> : null}
                <main>{children}</main>
            </div>
        )
    }

    return (
        // eslint-disable-next-line react/forbid-dom-props
        <div className={clsx('Navigation3000', mobileLayout && 'Navigation3000--mobile')} style={theme?.mainStyle}>
            <FlaggedFeature flag={FEATURE_FLAGS.TREE_VIEW} fallback={<Navbar />}>
                <ProjectTree />
            </FlaggedFeature>
            <FlaggedFeature flag={FEATURE_FLAGS.POSTHOG_3000_NAV}>
                {activeNavbarItem && <Sidebar key={activeNavbarItem.identifier} navbarItem={activeNavbarItem} />}
            </FlaggedFeature>
            <main>
                {(sceneConfig?.layout !== 'app-raw-no-header' || mobileLayout) && <TopBar />}
                <div
                    className={clsx(
                        'Navigation3000__scene',
                        // Hack - once we only have 3000 the "minimal" scenes should become "app-raw"
                        sceneConfig?.layout === 'app-raw' && 'Navigation3000__scene--raw',
                        sceneConfig?.layout === 'app-raw-no-header' && 'Navigation3000__scene--raw-no-header'
                    )}
                >
                    {(!sceneConfig?.hideBillingNotice || !sceneConfig?.hideProjectNotice) && (
                        <div className={sceneConfig?.layout === 'app-raw-no-header' ? 'px-4' : ''}>
                            {!sceneConfig?.hideBillingNotice && <BillingAlertsV2 />}
                            {!sceneConfig?.hideProjectNotice && <ProjectNotice />}
                        </div>
                    )}

                    {children}
                </div>
            </main>
            <SidePanel />
            <CommandBar />
        </div>
    )
}
