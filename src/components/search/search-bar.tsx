'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, User, Calendar, Eye, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'post' | 'tag' | 'category';
  title?: string;
  name?: string;
  slug?: string;
  excerpt?: string;
  description?: string;
  author?: {
    username: string;
    displayName?: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  tags?: Array<{
    tag: {
      name: string;
      slug: string;
    };
  }>;
  publishedAt?: string;
  viewCount?: number;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchBar({ 
  className, 
  placeholder = "搜索文章、标签、分类...", 
  showSuggestions = true,
  onSearch
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const performSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setShowDropdown(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch, performSearch]);

  const handleResultClick = useCallback((result: SearchResult) => {
    setShowDropdown(false);
    setQuery('');
    
    switch (result.type) {
      case 'post':
        router.push(`/posts/${result.slug}`);
        break;
      case 'tag':
        router.push(`/tags/${result.slug}`);
        break;
      case 'category':
        router.push(`/categories/${result.slug}`);
        break;
    }
  }, [router]);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
      setShowDropdown(false);
    }
  }, [query, onSearch, router]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showDropdown) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          } else if (query.trim()) {
            handleSearch();
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, results, selectedIndex, query, handleResultClick, handleSearch]);



  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };

  return (
    <div className={cn("relative", className)} ref={searchRef}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white text-base transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 搜索建议下拉框 */}
      {showSuggestions && showDropdown && (results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto w-full sm:min-w-[500px] lg:min-w-[600px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500 dark:text-gray-400 text-base">搜索中...</span>
            </div>
          ) : (
            <>
              {/* 搜索结果 */}
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className={cn(
                    "px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0",
                    selectedIndex === index && "bg-indigo-50 dark:bg-indigo-900/20"
                  )}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start space-x-4">
                    {/* 类型图标 */}
                    <div className="flex-shrink-0 mt-1">
                      {result.type === 'post' && (
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-105">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">文</span>
                        </div>
                      )}
                      {result.type === 'tag' && (
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-105">
                          <span className="text-green-600 dark:text-green-400 text-sm font-medium">标</span>
                        </div>
                      )}
                      {result.type === 'category' && (
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-105">
                          <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">类</span>
                        </div>
                      )}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* 标题和作者 */}
                      <div className="space-y-2">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                          {result.type === 'post' ? result.title : result.name}
                        </h4>
                        {result.type === 'post' && result.author && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <User className="h-4 w-4" />
                            <span>{result.author.displayName || result.author.username}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 描述内容 */}
                      {result.type === 'post' && result.excerpt && (
                        <p 
                          className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(result.excerpt, query) 
                          }}
                        />
                      )}
                      
                      {result.type === 'tag' && result.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      
                      {result.type === 'category' && result.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                          {result.description}
                        </p>
                      )}

                      {/* 元信息 */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {result.type === 'post' && result.publishedAt && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(result.publishedAt).toLocaleDateString('zh-CN')}</span>
                          </div>
                        )}
                        {result.type === 'post' && result.viewCount !== undefined && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{result.viewCount} 次浏览</span>
                          </div>
                        )}
                        {result.type === 'post' && result.category && (
                          <div className="flex items-center space-x-1">
                            <FolderOpen className="h-3 w-3" />
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              {result.category.name}
                            </span>
                          </div>
                        )}
                        {result.type === 'post' && result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {result.tags.slice(0, 3).map((pt, idx) => (
                              <span 
                                key={idx}
                                className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                              >
                                {pt.tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 查看更多结果 */}
              {results.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-900/10">
                  <button
                    onClick={handleSearch}
                    className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium py-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200 border border-indigo-200 dark:border-indigo-800"
                  >
                    查看全部搜索结果 ({results.length})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 