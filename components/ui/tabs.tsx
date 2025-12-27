"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Mobile-first: scrollable horizontally, full width
      "flex w-full overflow-x-auto scrollbar-hide",
      "h-auto min-h-[40px] items-center gap-1",
      "rounded-md bg-gray-100 dark:bg-gray-800 p-1",
      // Desktop: inline and centered
      "md:inline-flex md:h-10 md:w-auto md:justify-center md:overflow-visible",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Mobile-first: smaller padding, flexible sizing
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm",
      "px-2 py-1.5 text-xs font-medium transition-all flex-shrink-0",
      // Desktop: larger padding and text
      "md:px-3 md:py-1.5 md:text-sm",
      // Colors
      "text-gray-600 dark:text-gray-300",
      "hover:text-gray-900 dark:hover:text-white",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      // Active state
      "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900",
      "data-[state=active]:text-gray-900 dark:data-[state=active]:text-white",
      "data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }