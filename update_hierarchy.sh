#!/bin/bash
cat src/components/HierarchyView.tsx | grep -n "return (" | head -n 1
