
/**
 * Content extraction service for web browsing
 * @module services/browsing/contentExtractor
 */

/**
 * Extracts content from HTML based on extraction type
 * @param html - The HTML content to extract from
 * @param url - The URL of the page
 * @param extractionType - Type of content to extract
 * @returns Extracted content and metadata
 */
export function extractContent(
  html: string,
  url: string,
  extractionType: 'full' | 'product' | 'article' | 'review'
): { content: string; metadata: Record<string, any> } {
  // Create basic parser using browser's DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Basic metadata extraction that works for most pages
  const metadata: Record<string, any> = {
    title: doc.title || '',
    description: getMetaContent(doc, 'description') || '',
    url: url,
    lastUpdated: new Date().toISOString()
  };
  
  let content = '';
  
  // Extract content based on extraction type
  switch (extractionType) {
    case 'product':
      content = extractProductContent(doc, url, metadata);
      break;
    case 'article':
      content = extractArticleContent(doc, metadata);
      break;
    case 'review':
      content = extractReviewContent(doc, metadata);
      break;
    case 'full':
    default:
      content = extractFullContent(doc);
      break;
  }
  
  return { content, metadata };
}

/**
 * Gets meta tag content by name
 */
function getMetaContent(doc: Document, name: string): string | null {
  const meta = doc.querySelector(`meta[name="${name}"]`) || 
               doc.querySelector(`meta[property="og:${name}"]`);
  return meta ? meta.getAttribute('content') : null;
}

/**
 * Extracts product information from HTML
 */
function extractProductContent(doc: Document, url: string, metadata: Record<string, any>): string {
  // Extract product-specific metadata
  metadata.price = extractPrice(doc);
  metadata.imageUrl = extractMainImage(doc);
  metadata.productDetails = extractProductDetails(doc);
  
  // Based on the URL, apply site-specific extraction
  if (url.includes('amazon.com')) {
    return extractAmazonProduct(doc);
  } else if (url.includes('bestbuy.com')) {
    return extractBestBuyProduct(doc);
  } else {
    // Generic product extraction
    const productDesc = doc.querySelector('.product-description, [id*="description"], [class*="description"]');
    return productDesc ? productDesc.textContent?.trim() || '' : 'Product information extracted';
  }
}

/**
 * Extracts article content from HTML
 */
function extractArticleContent(doc: Document, metadata: Record<string, any>): string {
  // Look for common article content containers
  const articleContent = doc.querySelector('article, .article, .post, [role="main"], main');
  
  if (articleContent) {
    // Remove navigation, ads, comments, etc.
    Array.from(articleContent.querySelectorAll('nav, .nav, .navigation, .ads, .comments, aside'))
      .forEach(el => el.remove());
    
    return articleContent.textContent?.trim() || 'Article content extracted';
  }
  
  return 'Article content could not be extracted precisely';
}

/**
 * Extracts review content from HTML
 */
function extractReviewContent(doc: Document, metadata: Record<string, any>): string {
  // Look for review sections
  const reviewSection = doc.querySelector('.reviews, #reviews, [id*="review"], [class*="review"]');
  
  if (reviewSection) {
    metadata.reviewCount = extractReviewCount(doc);
    metadata.rating = extractRating(doc);
    
    return reviewSection.textContent?.trim() || 'Review content extracted';
  }
  
  return 'Review content could not be extracted precisely';
}

/**
 * Extracts the full page content
 */
function extractFullContent(doc: Document): string {
  // Remove script, style, and other non-content elements
  Array.from(doc.querySelectorAll('script, style, meta, link, noscript'))
    .forEach(el => el.remove());
  
  // Get body text
  return doc.body.textContent?.trim() || 'Content extracted';
}

// Helper functions for specific extraction needs
function extractPrice(doc: Document): string {
  const priceEl = doc.querySelector('[itemprop="price"], .price, .product-price, [class*="price"]');
  return priceEl ? priceEl.textContent?.trim() || '' : '';
}

function extractMainImage(doc: Document): string {
  const img = doc.querySelector('[itemprop="image"], .product-image img, [id*="main-image"]');
  return img ? img.getAttribute('src') || '' : '';
}

function extractProductDetails(doc: Document): Record<string, string> {
  const details: Record<string, string> = {};
  
  // Look for specification tables
  const specTable = doc.querySelector('.product-specs, .specifications, table[class*="spec"]');
  if (specTable) {
    const rows = specTable.querySelectorAll('tr');
    rows.forEach(row => {
      const label = row.querySelector('th, td:first-child');
      const value = row.querySelector('td:last-child');
      
      if (label && value) {
        details[label.textContent?.trim() || ''] = value.textContent?.trim() || '';
      }
    });
  }
  
  return details;
}

function extractReviewCount(doc: Document): string {
  const countEl = doc.querySelector('[itemprop="reviewCount"], [class*="review-count"]');
  return countEl ? countEl.textContent?.trim() || '' : '';
}

function extractRating(doc: Document): string {
  const ratingEl = doc.querySelector('[itemprop="ratingValue"], [class*="rating"]');
  return ratingEl ? ratingEl.textContent?.trim() || '' : '';
}

function extractAmazonProduct(doc: Document): string {
  // Amazon-specific extraction
  const productTitle = doc.querySelector('#productTitle, .product-title');
  const productDesc = doc.querySelector('#productDescription, .product-description');
  const features = doc.querySelector('#feature-bullets, .feature-bullets');
  
  let content = '';
  if (productTitle) content += productTitle.textContent?.trim() + '\n\n';
  if (features) content += 'Key Features:\n' + features.textContent?.trim() + '\n\n';
  if (productDesc) content += 'Description:\n' + productDesc.textContent?.trim();
  
  return content || 'Amazon product information extracted';
}

function extractBestBuyProduct(doc: Document): string {
  // Best Buy-specific extraction
  const productTitle = doc.querySelector('.sku-title, .heading-5');
  const productDesc = doc.querySelector('.product-description, .pd-description');
  
  let content = '';
  if (productTitle) content += productTitle.textContent?.trim() + '\n\n';
  if (productDesc) content += 'Description:\n' + productDesc.textContent?.trim();
  
  return content || 'Best Buy product information extracted';
}
