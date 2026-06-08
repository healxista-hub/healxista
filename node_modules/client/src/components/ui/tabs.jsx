import * as React from "react"

// Simple Tabs implementation without Radix UI dependency
const TabsContext = React.createContext({});

const Tabs = ({ defaultValue, value, onValueChange, className = "", children }) => {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue);

    React.useEffect(() => {
        if (value !== undefined) setActiveTab(value);
    }, [value]);

    const handleChange = (newValue) => {
        if (value === undefined) setActiveTab(newValue);
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange }}>
            <div className={className}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

const TabsList = ({ className = "", children }) => (
    <div
        role="tablist"
        className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
    >
        {children}
    </div>
);

const TabsTrigger = ({ value, className = "", children, disabled }) => {
    const { activeTab, setActiveTab } = React.useContext(TabsContext);
    const isActive = activeTab === value;
    return (
        <button
            role="tab"
            type="button"
            disabled={disabled}
            aria-selected={isActive}
            onClick={() => setActiveTab(value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50 hover:text-foreground"
            } ${className}`}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ value, className = "", children }) => {
    const { activeTab } = React.useContext(TabsContext);
    if (activeTab !== value) return null;
    return (
        <div
            role="tabpanel"
            className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
        >
            {children}
        </div>
    );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
