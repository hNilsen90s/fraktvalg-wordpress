import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { clsx } from "clsx";

/**
 * A reusable expandable section component that can be used to show/hide content.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.title - The title of the section
 * @param {React.ReactNode} props.content - The content to show when expanded
 * @param {React.ReactNode} props.badge - Optional badge content to display next to the title
 * @param {boolean} props.visible - Whether the section is expanded by default
 * @param {string} props.classNames - Additional classes for the outer container
 * @param {string} props.innerClassNames - Additional classes for the inner content container
 * @returns {React.ReactElement}
 */
export default function ExpandableSection({ 
    title, 
    content, 
    badge = null,
    visible = false, 
    classNames = '', 
    innerClassNames = '' 
}) {
    const [isVisible, setIsVisible] = useState(visible);
    
    const outerClasses = clsx(
        'border bg-white rounded-md',
        classNames
    );
    
    const innerClasses = clsx(
        'border-t-2 border-gray-100 p-4',
        innerClassNames
    );

    return (
        <div className={outerClasses}>
            <button 
                className="flex w-full p-4 items-center justify-between" 
                onClick={() => setIsVisible(!isVisible)}
            >
                <h2 className="text-lg font-bold w-full">
                    <div className="flex item-center justify-between focus:outline-none w-full">
                        <div className="flex">
                            {title}
                        </div>
                        <div className="flex items-center gap-4">
                            {badge && (
                                <div className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-600">
                                    {badge}
                                </div>
                            )}
                            {isVisible
                                ? <ChevronUpIcon className="h-6 w-6 text-gray-600" />
                                : <ChevronDownIcon className="h-6 w-6 text-gray-600" />
                            }
                        </div>
                    </div>
                </h2>
            </button>
            {isVisible && (
                <div className={innerClasses}>
                    {content}
                </div>
            )}
        </div>
    );
} 