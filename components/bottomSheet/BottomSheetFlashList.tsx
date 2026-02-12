import { FlashList, FlashListProps } from '@shopify/flash-list';
import { createBottomSheetScrollableComponent, SCROLLABLE_TYPE } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';

// Create a custom BottomSheetFlashList component
// This resolves the deprecation warning from @gorhom/bottom-sheet v5
const BottomSheetFlashList = createBottomSheetScrollableComponent<
    FlashListProps<any>,
    any
>(SCROLLABLE_TYPE.FLATLIST, FlashList);

export default BottomSheetFlashList;
