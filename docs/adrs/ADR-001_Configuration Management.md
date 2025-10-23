# ADR-001: Central File for Configuration Management

## Status
[Accepted]

## Context
Create configuration files that contain a single source of truth for all application settings and utility helper functions. 

## Decision
 The config.js file prevents having scattered functionality throughout the application code, everything is organized in one place. The JQueryUtils class is a safety wrapper around jQuery that prevents the application from crashing. The ValidationUtils class is a standardized and secure feature for standardized form validation and controls.

## Consequences
Defensive Programming: Central control prevents configuration bugs
Maintainability: Change animation speed once, affects entire site
Feature Management: Disable contact form if API is down
Debug Control: Turn off verbose logging for production
Consistency: All components use same validation rules

## Implementation Notes
Specific technical details about how this will be implemented.

**Date**: 2025-10-15
**Authors**: Alvin Logenstein
**Reviewers**: Alvin Logenstein