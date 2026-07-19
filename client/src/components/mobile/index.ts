// client/src/components/mobile/index.ts
// Barrel export for the mobile-first component library.

export { TeacherUploaderForm } from "./TeacherUploaderForm";
export type { TeacherUploaderFormProps } from "./TeacherUploaderForm";
export { LessonHeader } from "./LessonHeader";
export type { LessonHeaderProps } from "./LessonHeader";
export { LessonViewer } from "./LessonViewer";
export type { LessonViewerProps, Flashcard, PracticeQuestion } from "./LessonViewer";
export { AIBuddyChat } from "./AIBuddyChat";
export type { AIBuddyChatProps, ChatMessage, Citation } from "./AIBuddyChat";
export { SwipeToDismiss } from "./SwipeToDismiss";
export { MobileToast } from "./MobileToast";
export { useKeyboardSafeView } from "./useKeyboardSafeView";
export { useDynamicLayout } from "./useDynamicLayout";
export { BREAKPOINTS, FONT_SCALE, SPACING, TAP_TARGET, STYLE_TOKENS } from "./tokens";
export type { LayoutVariant } from "./tokens";
export type { DynamicLayout } from "./useDynamicLayout";
