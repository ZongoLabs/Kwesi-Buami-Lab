
import React from 'react';
import { HomeIcon, PencilSquareIcon, SparklesIcon, SwatchIcon, CodeBracketSquareIcon, LanguageIcon, PhotoIcon, MicrophoneIcon, ArrowPathIcon, CaseIcon, QrCodeIcon, DocumentTextIcon, SpeakerWaveIcon, AcademicCapIcon, BugAntIcon, MegaphoneIcon, UserCircleIcon, PuzzlePieceIcon, BookOpenIcon, NewspaperIcon, DocumentDuplicateIcon, CalculatorIcon, GlobeAltIcon, ShieldCheckIcon, EyeDropperIcon } from './components/Icons';
import HomePage from './pages/HomePage';
import ContentSummarizerPage from './pages/ContentSummarizerPage';
import ColorPalettePage from './pages/ColorPalettePage';
import CodeSnippetGeneratorPage from './pages/CodeSnippetGeneratorPage';
import LanguageTranslatorPage from './pages/LanguageTranslatorPage';
import ImageGeneratorPage from './pages/ImageGeneratorPage';
import VoiceTranscriberPage from './pages/VoiceTranscriberPage';
import ContentExpanderPage from './pages/ContentExpanderPage';
import TestCaseConverterPage from './pages/TestCaseConverterPage';
import QrCodeGeneratorPage from './pages/QrCodeGeneratorPage';
import WordCounterPage from './pages/WordCounterPage';
import TextToSpeechPage from './pages/TextToSpeechPage';
import BackgroundRemoverPage from './pages/BackgroundRemoverPage';
import ResearchSummarizerPage from './pages/ResearchSummarizerPage';
import DebuggingAssistantPage from './pages/DebuggingAssistantPage';
import MarketingCopywriterPage from './pages/MarketingCopywriterPage';
import AvatarStylizerPage from './pages/AvatarStylizerPage';
import EmojiRiddlesPage from './pages/EmojiRiddlesPage';
import InfiniteStorytellerPage from './pages/InfiniteStorytellerPage';
import ArticleWriterPage from './pages/ArticleWriterPage';
import PlagiarismRewriterPage from './pages/PlagiarismRewriterPage';
import MathSolverPage from './pages/MathSolverPage';
import WorldHistoryPage from './pages/WorldHistoryPage';
import PlagiarismCheckerPage from './pages/PlagiarismCheckerPage';
import ColorPickerPage from './pages/ColorPickerPage';
import { type Tool, type ToolCategory } from './types';

const TOOLS: Tool[] = [
  {
    id: 'home',
    name: 'Home',
    description: 'Welcome to OmniTools',
    path: '/',
    icon: <HomeIcon />,
    component: HomePage,
    category: 'Home'
  },
  {
    id: 'content-summarizer',
    name: 'Content Summarizer',
    description: 'Generate concise summaries of long articles or documents.',
    path: '/summarizer',
    icon: <PencilSquareIcon />,
    component: ContentSummarizerPage,
    category: 'Text & Content Tools'
  },
  {
    id: 'content-expander',
    name: 'Content Expander & Rewriter',
    description: 'Expand on short points or rewrite existing text.',
    path: '/expander',
    icon: <ArrowPathIcon />,
    component: ContentExpanderPage,
    category: 'Text & Content Tools'
  },
  {
    id: 'article-writer',
    name: 'Article Writer',
    description: 'Generate full-length articles from a topic.',
    path: '/article-writer',
    icon: <NewspaperIcon />,
    component: ArticleWriterPage,
    category: 'Text & Content Tools'
    },
    {
    id: 'plagiarism-rewriter',
    name: 'Originality Rewriter',
    description: 'Rewrite text to improve its uniqueness and clarity.',
    path: '/plagiarism-rewriter',
    icon: <DocumentDuplicateIcon />,
    component: PlagiarismRewriterPage,
    category: 'Text & Content Tools'
  },
  {
    id: 'plagiarism-checker',
    name: 'Plagiarism Checker',
    description: 'Scan text against web sources to check for plagiarism.',
    path: '/plagiarism-checker',
    icon: <ShieldCheckIcon />,
    component: PlagiarismCheckerPage,
    category: 'Text & Content Tools'
  },
  {
    id: 'language-translator',
    name: 'Language Translator',
    description: 'Translate text into a wide range of languages.',
    path: '/translator',
    icon: <LanguageIcon />,
    component: LanguageTranslatorPage,
    category: 'Text & Content Tools'
  },
  {
    id: 'text-case-converter',
    name: 'Text Case Converter',
    description: 'Convert text to various cases (e.g., camelCase).',
    path: '/case-converter',
    icon: <CaseIcon />,
    component: TestCaseConverterPage,
    category: 'Text & Content Tools'
  },
   {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, and paragraphs in your text.',
    path: '/word-counter',
    icon: <DocumentTextIcon />,
    component: WordCounterPage,
    category: 'Text & Content Tools'
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Convert text or documents to natural-sounding speech.',
    path: '/text-to-speech',
    icon: <SpeakerWaveIcon />,
    component: TextToSpeechPage,
    category: 'Text & Content Tools'
  },
  {
    id: 'color-palette-generator',
    name: 'Color Palette Generator',
    description: 'Generate harmonious color palettes from an input image.',
    path: '/palette-generator',
    icon: <SwatchIcon />,
    component: ColorPalettePage,
    category: 'Image & Graphics Tools'
  },
  {
    id: 'color-picker',
    name: 'Image Color Picker',
    description: 'Pick colors from an image with an interactive eyedropper.',
    path: '/color-picker',
    icon: <EyeDropperIcon />,
    component: ColorPickerPage,
    category: 'Image & Graphics Tools'
  },
    {
    id: 'image-generator',
    name: 'Image Generator',
    description: 'Create unique images from text descriptions.',
    path: '/image-generator',
    icon: <PhotoIcon />,
    component: ImageGeneratorPage,
    category: 'Image & Graphics Tools'
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Automatically remove the background from any image.',
    path: '/background-remover',
    icon: <SparklesIcon />,
    component: BackgroundRemoverPage,
    category: 'Image & Graphics Tools'
  },
  {
    id: 'avatar-stylizer',
    name: 'Avatar Stylizer',
    description: 'Turn your photo into a unique, stylized avatar.',
    path: '/avatar-stylizer',
    icon: <UserCircleIcon />,
    component: AvatarStylizerPage,
    category: 'Image & Graphics Tools'
  },
  {
    id: 'voice-transcriber',
    name: 'Voice Transcriber',
    description: 'Record your voice and convert it to text.',
    path: '/transcriber',
    icon: <MicrophoneIcon />,
    component: VoiceTranscriberPage,
    category: 'Audio & Video Tools'
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate a QR code from text or a URL.',
    path: '/qr-generator',
    icon: <QrCodeIcon />,
    component: QrCodeGeneratorPage,
    category: 'Data & Productivity Tools'
  },
  {
    id: 'code-snippet-generator',
    name: 'Code Snippet Generator',
    description: 'Generate code snippets from natural language descriptions.',
    path: '/code-generator',
    icon: <CodeBracketSquareIcon />,
    component: CodeSnippetGeneratorPage,
    category: 'Developer & ICT Tools'
  },
  {
    id: 'debugging-assistant',
    name: 'Code Debugger',
    description: 'Get explanations and fixes for code errors.',
    path: '/debugger',
    icon: <BugAntIcon />,
    component: DebuggingAssistantPage,
    category: 'Developer & ICT Tools'
  },
  {
    id: 'research-summarizer',
    name: 'Research Summarizer',
    description: 'Extract key points from academic papers.',
    path: '/research-summarizer',
    icon: <AcademicCapIcon />,
    component: ResearchSummarizerPage,
    category: 'Academics & Research'
  },
    {
    id: 'math-solver',
    name: 'Math Solver',
    description: 'Solve math problems with step-by-step solutions.',
    path: '/math-solver',
    icon: <CalculatorIcon />,
    component: MathSolverPage,
    category: 'Education & Learning'
  },
  {
    id: 'world-history',
    name: 'History Storyteller',
    description: 'Explore any historical event as a captivating story.',
    path: '/world-history',
    icon: <GlobeAltIcon />,
    component: WorldHistoryPage,
    category: 'Education & Learning',
  },
  {
    id: 'marketing-copywriter',
    name: 'Marketing Copy Generator',
    description: 'Generate compelling marketing copy for ads, posts, and more.',
    path: '/marketing-copy',
    icon: <MegaphoneIcon />,
    component: MarketingCopywriterPage,
    category: 'Business & Marketing'
  },
  {
    id: 'emoji-riddles',
    name: 'Emoji Riddles',
    description: 'Solve clever riddles made of emojis.',
    path: '/emoji-riddles',
    icon: <PuzzlePieceIcon />,
    component: EmojiRiddlesPage,
    category: 'Games'
  },
  {
    id: 'infinite-storyteller',
    name: 'Collaborative Storywriter',
    description: 'Collaborate with a storyteller to write a never-ending story.',
    path: '/infinite-storyteller',
    icon: <BookOpenIcon />,
    component: InfiniteStorytellerPage,
    category: 'Games'
  }
];

const categoryOrder = [
    'Home',
    'Text & Content Tools',
    'Image & Graphics Tools',
    'Audio & Video Tools',
    'Games',
    'Developer & ICT Tools',
    'Business & Marketing',
    'Academics & Research',
    'Education & Learning',
    'Data & Productivity Tools'
];

export const TOOL_CATEGORIES: ToolCategory[] = categoryOrder.map(categoryName => ({
    name: categoryName,
    tools: TOOLS.filter(t => t.category === categoryName)
})).filter(c => c.tools.length > 0);