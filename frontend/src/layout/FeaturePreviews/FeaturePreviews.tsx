import { LemonButton, LemonDivider, LemonSwitch, LemonTextArea, Link } from '@posthog/lemon-ui'
import clsx from 'clsx'
import { useActions, useAsyncActions, useValues } from 'kea'
import { IconLink } from 'lib/lemon-ui/icons'
import { SpinnerOverlay } from 'lib/lemon-ui/Spinner'
import { useLayoutEffect, useState } from 'react'

import { EnrichedEarlyAccessFeature, featurePreviewsLogic } from './featurePreviewsLogic'

export function FeaturePreviews({ focusedFeatureFlagKey }: { focusedFeatureFlagKey?: string }): JSX.Element {
    const { earlyAccessFeatures, rawEarlyAccessFeaturesLoading } = useValues(featurePreviewsLogic)
    const { loadEarlyAccessFeatures } = useActions(featurePreviewsLogic)

    useLayoutEffect(() => loadEarlyAccessFeatures(), [])

    useLayoutEffect(() => {
        if (earlyAccessFeatures.length > 0 && focusedFeatureFlagKey) {
            const element = document.getElementById(`feature-preview-${focusedFeatureFlagKey}`)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }, [focusedFeatureFlagKey, earlyAccessFeatures])

    return (
        <div
            className={clsx(
                'flex flex-col relative min-h-24',
                earlyAccessFeatures.length === 0 && 'items-center justify-center'
            )}
        >
            {earlyAccessFeatures.map((feature, i) => {
                if (!feature.flagKey) {
                    return false
                }
                return (
                    <div key={feature.flagKey} id={`feature-preview-${feature.flagKey}`}>
                        {i > 0 && <LemonDivider className="my-4" />}
                        <FeaturePreview key={feature.flagKey} feature={feature} />
                    </div>
                )
            })}
            {rawEarlyAccessFeaturesLoading ? (
                <SpinnerOverlay />
            ) : earlyAccessFeatures.length === 0 ? (
                <i className="text-center">
                    No feature previews currently available.
                    <br />
                    Check back later!
                </i>
            ) : null}
        </div>
    )
}

function FeaturePreview({ feature }: { feature: EnrichedEarlyAccessFeature }): JSX.Element {
    const { activeFeedbackFlagKey, activeFeedbackFlagKeyLoading } = useValues(featurePreviewsLogic)
    const {
        beginEarlyAccessFeatureFeedback,
        cancelEarlyAccessFeatureFeedback,
        updateEarlyAccessFeatureEnrollment,
        copyExternalFeaturePreviewLink,
    } = useActions(featurePreviewsLogic)
    const { submitEarlyAccessFeatureFeedback } = useAsyncActions(featurePreviewsLogic)

    const { flagKey, enabled, name, description, documentationUrl } = feature
    const isFeedbackActive = activeFeedbackFlagKey === flagKey

    const [feedback, setFeedback] = useState('')

    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <h4 className="font-semibold mb-0">{name}</h4>
                    <LemonButton
                        icon={<IconLink />}
                        size="small"
                        onClick={() => copyExternalFeaturePreviewLink(flagKey)}
                    />
                </div>
                <LemonSwitch
                    checked={enabled}
                    onChange={(newChecked) => updateEarlyAccessFeatureEnrollment(flagKey, newChecked)}
                />
            </div>
            <p className="my-2">{description || <i>No description.</i>}</p>
            <div>
                {!isFeedbackActive ? (
                    <Link onClick={() => beginEarlyAccessFeatureFeedback(flagKey)}>Give feedback</Link>
                ) : null}
                {documentationUrl && (
                    <>
                        {' • '}
                        <Link to={documentationUrl} target="_blank">
                            Learn more
                        </Link>
                    </>
                )}
            </div>
            {isFeedbackActive && (
                <div className="flex flex-col gap-2">
                    <LemonTextArea
                        autoFocus
                        placeholder={`What's your experience with ${name} been like?`}
                        className="mt-2"
                        value={feedback}
                        onChange={(value) => setFeedback(value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.metaKey) {
                                updateEarlyAccessFeatureEnrollment(flagKey, enabled)
                            } else if (e.key === 'Escape') {
                                cancelEarlyAccessFeatureFeedback()
                                setFeedback('')
                                e.stopPropagation() // Don't close the modal
                            }
                        }}
                    />
                    <div className="flex items-center gap-2">
                        <LemonButton
                            type="secondary"
                            onClick={() => {
                                cancelEarlyAccessFeatureFeedback()
                                setFeedback('')
                            }}
                        >
                            Cancel
                        </LemonButton>

                        <LemonButton
                            type="primary"
                            onClick={() => {
                                void submitEarlyAccessFeatureFeedback(feedback).then(() => {
                                    setFeedback('')
                                })
                            }}
                            loading={activeFeedbackFlagKeyLoading}
                            className="flex-1"
                            center
                        >
                            Submit feedback
                        </LemonButton>
                    </div>
                </div>
            )}
        </div>
    )
}
