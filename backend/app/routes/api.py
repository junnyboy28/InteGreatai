from fastapi import APIRouter, HTTPException, Depends, Body
from app.models.schemas import ApiRequest, ApiResponse
from app.services.extractor import ApiExtractor
from app.services.gemini_service import GeminiService
from app.services.generator import WrapperGenerator
import logging
import httpx
from typing import Dict, Any

router = APIRouter(prefix="/api", tags=["api"])
logger = logging.getLogger(__name__)

# Create service instances
extractor = ApiExtractor()
gemini_service = GeminiService()
generator = WrapperGenerator(gemini_service)

@router.post("/analyze", response_model=ApiResponse)
async def analyze_api(request: ApiRequest):
    """
    Analyze an API from its documentation and generate a wrapper class
    """
    try:
        # Step 1: Extract information from the API documentation URL
        extracted_data = await extractor.extract_from_url(str(request.documentation_url))
        
        # Step 2: Process the documentation and generate wrapper code
        result = await generator.process_api_documentation(
            extracted_data,
            request.use_case,
            request.preferred_language
        )
        
        # Return the response
        return ApiResponse(
            endpoints=result["endpoints"],
            auth_methods=result["auth_methods"],
            suggested_integration=result["suggested_integration"],
            wrapper_code=result["wrapper_code"],
            env_template=result.get("env_template", "")
        )
        
    except Exception as e:
        logger.error(f"Error processing API request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process API: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "ok"}

@router.post("/test-endpoint")
async def test_endpoint(
    url: str = Body(...),
    method: str = Body(...),
    headers: Dict[str, str] = Body({}),
    params: Dict[str, str] = Body({}),
    body: Dict[str, Any] = Body({})
):
    """
    Proxy API calls for the test playground
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Convert method to lowercase
            method = method.lower()
            
            # Make the request based on the method
            if method == "get":
                response = await client.get(url, headers=headers, params=params)
            elif method == "post":
                response = await client.post(url, headers=headers, params=params, json=body)
            elif method == "put":
                response = await client.put(url, headers=headers, params=params, json=body)
            elif method == "delete":
                response = await client.delete(url, headers=headers, params=params)
            elif method == "patch":
                response = await client.patch(url, headers=headers, params=params, json=body)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported method: {method}")
            
            # Return the response
            return {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "response": response.text,
                "time_ms": response.elapsed.total_seconds() * 1000
            }
    except Exception as e:
        logger.error(f"Error testing endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to test endpoint: {str(e)}")