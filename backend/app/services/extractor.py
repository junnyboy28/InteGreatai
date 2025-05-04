import httpx
from bs4 import BeautifulSoup
import re
import logging
from typing import Dict, List, Any, Tuple

logger = logging.getLogger(__name__)

class ApiExtractor:
    def __init__(self):
        self.session = httpx.Client(follow_redirects=True)
    
    async def extract_from_url(self, url: str) -> Dict[str, Any]:
        """
        Extract API information from documentation URL
        """
        try:
            # Fetch the documentation page
            response = self.session.get(url, timeout=30.0)
            response.raise_for_status()
            
            # Parse content
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Extract text content for analysis by Gemini
            main_content = soup.find('main') or soup.find('body')
            text_content = main_content.get_text() if main_content else soup.get_text()
            
            # Clean and format text
            text_content = re.sub(r'\s+', ' ', text_content).strip()
            
            # Get potential endpoints by looking for common patterns
            potential_endpoints = self._extract_potential_endpoints(soup, text_content)
            
            # Get potential auth methods
            potential_auth = self._extract_auth_methods(soup, text_content)
            
            return {
                "raw_text": text_content[:50000],  # Limit text size
                "potential_endpoints": potential_endpoints,
                "potential_auth": potential_auth,
                "url": url
            }
        
        except Exception as e:
            logger.error(f"Error extracting from URL {url}: {str(e)}")
            raise
    
    def _extract_potential_endpoints(self, soup, text_content) -> List[Dict]:
        """Extract potential API endpoints from the documentation"""
        # Look for code blocks, endpoint patterns, etc.
        endpoints = []
        
        # Look for common REST API endpoint patterns in text
        endpoint_patterns = re.finditer(r'(GET|POST|PUT|DELETE|PATCH)\s+(/[\w/{}]+)', text_content)
        for match in endpoint_patterns:
            method, path = match.groups()
            endpoints.append({
                "method": method,
                "path": path,
                "raw_context": text_content[max(0, match.start()-100):min(len(text_content), match.end()+100)]
            })
        
        # Look for endpoint tables or lists in HTML
        for table in soup.find_all('table'):
            for row in table.find_all('tr'):
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    # Check if this looks like an API endpoint table
                    text = ' '.join(cell.get_text().strip() for cell in cells)
                    if re.search(r'(GET|POST|PUT|DELETE|PATCH)\s+(/[\w/{}]+)', text):
                        endpoints.append({
                            "context_type": "table",
                            "raw_context": str(table)[:1000]  # Limit size
                        })
                        break
        
        return endpoints
    
    def _extract_auth_methods(self, soup, text_content) -> List[Dict]:
        """Extract authentication methods from the documentation"""
        auth_methods = []
        
        # Look for common auth-related terms
        auth_terms = [
            "authentication", "authorization", "api key", "bearer token", 
            "oauth", "basic auth", "jwt", "access token"
        ]
        
        for term in auth_terms:
            # Simple search for mentions of auth methods
            matches = re.finditer(rf'\b{term}\b', text_content, re.IGNORECASE)
            for match in matches:
                start = max(0, match.start() - 100)
                end = min(len(text_content), match.end() + 200)
                context = text_content[start:end]
                
                auth_methods.append({
                    "term": term,
                    "context": context
                })
        
        return auth_methods