import json
import re
from typing import Dict, Any, List, Tuple
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

class WrapperGenerator:
    def __init__(self, gemini_service):
        self.gemini_service = gemini_service

    async def parse_gemini_analysis(self, analysis: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Parse Gemini's analysis to extract structured endpoint and auth information
        """
        try:
            # Try to find JSON in the response
            json_match = re.search(r'```json\s*(.*?)\s*```', analysis, re.DOTALL)
            if json_match:
                try:
                    json_str = json_match.group(1)
                    data = json.loads(json_str)
                    return data.get('endpoints', []), data.get('auth_methods', [])
                except json.JSONDecodeError as e:
                    logger.error(f"JSON parsing error: {str(e)}")
                    logger.error(f"Problematic JSON: {json_match.group(1)[:100]}...")
            
            # If no valid JSON found, try to extract structured information from text
            endpoints = []
            auth_methods = []

            # Extract endpoints using regex patterns
            endpoint_sections = re.finditer(r'(GET|POST|PUT|DELETE|PATCH)\s+(/[\w/{}]+)[^\n]*\n\s*([^\n]+)', analysis)
            for match in endpoint_sections:
                method, path, description = match.groups()
                endpoints.append({
                    "path": path.strip(),
                    "method": method.strip(),
                    "description": description.strip(),
                    "parameters": {}
                })

            # Extract auth methods
            auth_section = re.search(r'Authentication Methods?:(.*?)(?:##|\n\n|$)', analysis, re.DOTALL)
            if auth_section:
                auth_text = auth_section.group(1)
                auth_items = re.finditer(r'-\s*([^:]+):\s*([^\n]+)', auth_text)
                for match in auth_items:
                    auth_type, description = match.groups()
                    auth_methods.append({
                        "type": auth_type.strip(),
                        "description": description.strip()
                    })

            return endpoints, auth_methods

        except Exception as e:
            logger.error(f"Error parsing Gemini analysis: {str(e)}")
            return [], []

    async def generate_integration_suggestion(self,
                                             endpoints: List[Dict[str, Any]],
                                             auth_methods: List[Dict[str, Any]],
                                             use_case: str,
                                             language: str) -> str:
        """
        Generate suggestions for integration approaches
        """
        try:
            # Build prompt for Gemini
            endpoints_str = "\n".join([f"- {e['method']} {e['path']}: {e['description']}" for e in endpoints[:5]])  # Limit to first 5 endpoints
            auth_methods_str = "\n".join([f"- {a['type']}: {a['description']}" for a in auth_methods])

            prompt = f"""
            Based on the following API details and use case, suggest the best integration approach
            (REST client, SDK, etc.) for a {language} application:

            USE CASE: {use_case}

            ENDPOINTS:
            {endpoints_str}

            AUTHENTICATION:
            {auth_methods_str}

            Provide a brief, practical recommendation that considers:
            1. Ease of implementation
            2. Maintainability
            3. Performance
            4. Error handling
            5. Any existing libraries that might help
            """

            # Generate content without using await
            response = self.gemini_service.model.generate_content(
                prompt,
                generation_config=self.gemini_service.generation_config,
                safety_settings=self.gemini_service.safety_settings
            )

            # Extract text from response
            response_text = ""
            if hasattr(response, 'text'):
                response_text = response.text
            else:
                for candidate in response.candidates:
                    for part in candidate.content.parts:
                        if hasattr(part, "text"):
                            response_text += part.text

            return response_text

        except Exception as e:
            logger.error(f"Error generating integration suggestion: {str(e)}")
            return "Unable to generate integration suggestion due to an error."

    async def process_api_documentation(self,
                                        extracted_data: Dict[str, Any],
                                        use_case: str,
                                        language: str) -> Dict[str, Any]:
        """
        Process API documentation and generate wrapper code
        """
        # Analyze documentation with Gemini
        analysis_result = await self.gemini_service.analyze_api_documentation(extracted_data, use_case)

        # Parse the analysis to get structured endpoints and auth methods
        endpoints, auth_methods = await self.parse_gemini_analysis(analysis_result['analysis'])

        # Ensure parameters are in dictionary format
        for endpoint in endpoints:
            # Check if parameters is a list and convert to dictionary
            if isinstance(endpoint.get('parameters'), list):
                param_dict = {}
                for param in endpoint['parameters']:
                    if 'name' in param and isinstance(param, dict):
                        param_name = param['name']
                        param_info = {k: v for k, v in param.items() if k != 'name'}
                        param_dict[param_name] = param_info
                endpoint['parameters'] = param_dict

        # Generate integration suggestion - removed await
        integration_suggestion = "For this API, a direct REST client approach using standard libraries would be most appropriate."
        try:
            integration_suggestion = await self.generate_integration_suggestion(
                endpoints, auth_methods, use_case, language
            )
        except Exception as e:
            logger.error(f"Error in integration suggestion: {e}")
            # Continue with default suggestion

        # Generate wrapper code
        wrapper_code = await self.gemini_service.generate_wrapper_code(
            endpoints, auth_methods, language, use_case
        )

        # Generate .env template
        env_template = await self.generate_env_template(auth_methods)

        return {
            "endpoints": endpoints,
            "auth_methods": auth_methods,
            "suggested_integration": integration_suggestion,
            "wrapper_code": wrapper_code,
            "env_template": env_template
        }

    async def generate_env_template(self, auth_methods: List[Dict[str, Any]]) -> str:
        """
        Generate a .env file template based on the detected authentication methods
        """
        try:
            env_lines = ["# API Authentication Configuration"]
            
            for auth in auth_methods:
                auth_type = auth["type"].lower()
                
                # Handle common auth types
                if "api key" in auth_type:
                    env_lines.append("API_KEY=your_api_key_here")
                elif "oauth" in auth_type:
                    env_lines.append("OAUTH_CLIENT_ID=your_client_id_here")
                    env_lines.append("OAUTH_CLIENT_SECRET=your_client_secret_here")
                    env_lines.append("OAUTH_REDIRECT_URI=http://localhost:8000/callback")
                elif "bearer" in auth_type or "token" in auth_type:
                    env_lines.append("ACCESS_TOKEN=your_access_token_here")
                elif "basic" in auth_type:
                    env_lines.append("API_USERNAME=your_username_here")
                    env_lines.append("API_PASSWORD=your_password_here")
                else:
                    # Generic auth param
                    auth_name = auth_type.replace(" ", "_").upper()
                    env_lines.append(f"{auth_name}=your_value_here")
            
            # Add API base URL
            env_lines.append("\n# API Configuration")
            env_lines.append("API_BASE_URL=https://api.example.com")
            
            return "\n".join(env_lines)
        
        except Exception as e:
            logger.error(f"Error generating env template: {str(e)}")
            return "# Failed to generate .env template"