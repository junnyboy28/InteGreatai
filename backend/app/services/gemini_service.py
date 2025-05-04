import os
import google.generativeai as genai
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")

        # Configure the API
        genai.configure(api_key=api_key)

        # Choose a model
        self.model_name = 'gemini-1.5-flash'
        self.model = genai.GenerativeModel(self.model_name)
        self.generation_config = {
            "temperature": 0.2,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 8192,
        }
        self.safety_settings = []

    async def analyze_api_documentation(self, extracted_data: Dict[str, Any], use_case: str) -> Dict[str, Any]:
        """
        Use Gemini to analyze API documentation and extract endpoints and auth methods
        """
        try:
            # Prepare the prompt for Gemini
            prompt = f"""
            I need you to analyze this API documentation and extract important information.

            USE CASE: {use_case}

            Based on the following extracted text from the API documentation at {extracted_data['url']}, please:
            1. Identify the key API endpoints that would be most relevant for the use case
            2. Determine the authentication method(s) used by this API
            3. Return your findings in a structured format

            Here's the extracted documentation:
            {extracted_data['raw_text'][:10000]}  # Limit size to avoid token limits

            Potential endpoints found:
            {extracted_data['potential_endpoints']}

            Potential authentication methods found:
            {extracted_data['potential_auth']}

            Respond with a JSON structure that includes:
            - endpoints: list of dictionaries with path, method, description, parameters
            - auth_methods: list of dictionaries with type and description
            """

            # Use the current API for generating content - removing await as generate_content is not a coroutine
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config,
                safety_settings=self.safety_settings
            )

            response_text = ""
            if hasattr(response, 'text'):
                response_text = response.text
            else:
                for candidate in response.candidates:
                    for part in candidate.content.parts:
                        if hasattr(part, "text"):
                            response_text += part.text

            # Parse out the structured information from Gemini's response
            result = {
                "analysis": response_text,
                "parsed_endpoints": [],
                "parsed_auth_methods": []
            }

            return result

        except Exception as e:
            logger.error(f"Error using Gemini API: {str(e)}")
            raise

    async def generate_wrapper_code(self,
                                    endpoints: List[Dict[str, Any]],
                                    auth_methods: List[Dict[str, Any]],
                                    language: str,
                                    use_case: str) -> str:
        """
        Generate a wrapper class in the specified programming language
        """
        try:
            # Prepare the prompt for Gemini
            prompt = f"""
            Generate a complete, production-ready API wrapper class in {language} based on the following API details:

            USE CASE: {use_case}

            ENDPOINTS:
            {endpoints}

            AUTHENTICATION METHODS:
            {auth_methods}

            Requirements for the wrapper:
            1. Should handle authentication automatically
            2. Should have proper error handling
            3. Should be well-documented with comments
            4. Should follow best practices for {language}
            5. Should be designed for the specific use case provided

            Please generate only the code, no explanations needed.
            """

            # Use the current API for generating content - removing await as generate_content is not a coroutine
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config,
                safety_settings=self.safety_settings
            )

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
            logger.error(f"Error generating wrapper code: {str(e)}")
            raise