'use client'

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Calendar, Eye, User, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { SearchBar } from '@/components/search/search-bar';

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
  coverImage?: string | null;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  query: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchType, setSearchType] = useState<'all' | 'posts' | 'tags' | 'categories'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'views'>('relevance');

  const limit = 12;

  const performSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: currentPage.toString(),
        limit: limit.toString(),
        type: searchType,
        sort: sortBy
      });

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data: SearchResponse = await response.json();
        setResults(data.results || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query, currentPage, limit, searchType, sortBy]);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, currentPage, searchType, sortBy, performSearch]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">文</span>
        </div>;
      case 'tag':
        return <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <span className="text-green-600 dark:text-green-400 text-sm font-medium">标</span>
        </div>;
      case 'category':
        return <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
          <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">类</span>
        </div>;
      default:
        return null;
    }
  };

  const renderResult = (result: SearchResult) => {
    switch (result.type) {
      case 'post':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            {result.coverImage && (
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img 
                  src={result.coverImage} 
                  alt={result.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-3">
                {getResultIcon(result.type)}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    <Link 
                      href={`/posts/${result.slug}`}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {result.title}
                    </Link>
                  </h3>
                  {result.excerpt && (
                    <p 
                      className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(result.excerpt, query) 
                      }}
                    />
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                {result.author && (
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{result.author.displayName || result.author.username}</span>
                  </div>
                )}
                {result.publishedAt && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(result.publishedAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                )}
                {result.viewCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{result.viewCount}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {result.category && (
                  <Link 
                    href={`/categories/${result.category.slug}`}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
                  >
                    <FolderOpen className="h-3 w-3" />
                    <span>{result.category.name}</span>
                  </Link>
                )}
                {result.tags && result.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {result.tags.slice(0, 3).map((pt, idx) => (
                      <Link
                        key={idx}
                        href={`/tags/${pt.tag.slug}`}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {pt.tag.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'tag':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
            <div className="flex items-start space-x-3 mb-4">
              {getResultIcon(result.type)}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <Link 
                    href={`/tags/${result.slug}`}
                    className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    #{result.name}
                  </Link>
                </h3>
                {result.description && (
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                    {result.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'category':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
            <div className="flex items-start space-x-3 mb-4">
              {getResultIcon(result.type)}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <Link 
                    href={`/categories/${result.slug}`}
                    className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {result.name}
                  </Link>
                </h3>
                {result.description && (
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                    {result.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Search className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              搜索博客内容
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              输入关键词搜索文章、标签和分类
            </p>
            <div className="max-w-md mx-auto">
              <SearchBar 
                placeholder="开始搜索..."
                showSuggestions={false}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 搜索头部 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                搜索结果
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                找到 <span className="font-semibold text-indigo-600 dark:text-indigo-400">{total}</span> 个结果
                {query && (
                  <>
                    {' '}关于{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">&quot;{query}&quot;</span>
                  </>
                )}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <SearchBar 
                placeholder="搜索..."
                showSuggestions={false}
                onSearch={handleSearch}
                className="w-full sm:w-80"
              />
            </div>
          </div>

          {/* 筛选和排序 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">类型:</span>
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'posts', label: '文章' },
                  { value: 'tags', label: '标签' },
                  { value: 'categories', label: '分类' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setSearchType(type.value as 'all' | 'posts' | 'tags' | 'categories');
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      searchType === type.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">排序:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'relevance' | 'date' | 'views');
                  setCurrentPage(1);
                }}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="relevance">相关度</option>
                <option value="date">发布时间</option>
                <option value="views">浏览量</option>
              </select>
            </div>
          </div>
        </div>

        {/* 搜索结果 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">搜索中...</span>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {results.map((result) => (
                <div key={`${result.type}-${result.id}`}>
                  {renderResult(result)}
                </div>
              ))}
            </div>

            {/* 分页 */}
            {total > limit && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === Math.ceil(total / limit) || Math.abs(page - currentPage) <= 2)
                  .map((page, index, array) => (
                    <div key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 py-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          page === currentPage
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(total / limit)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              没有找到相关结果
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              尝试使用不同的关键词或检查拼写
            </p>
            <button
              onClick={() => router.push('/search')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              重新搜索
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 