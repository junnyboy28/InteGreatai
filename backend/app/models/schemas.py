from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any

class ApiRequest(BaseModel):
    documentation_url: HttpUrl = Field(..., description="URL of the API documentation")
    use_case: str = Field(..., description="Brief description of the intended use case")
    preferred_language: str = Field(..., description="Preferred programming language for wrapper class")

class Endpoint(BaseModel):
    path: str
    method: str
    description: str
    parameters: Optional[Dict[str, Any]] = None
    response_example: Optional[Dict[str, Any]] = None

class AuthMethod(BaseModel):
    type: str
    description: str

class ApiResponse(BaseModel):
    endpoints: List[Endpoint]
    auth_methods: List[AuthMethod]
    suggested_integration: str
    wrapper_code: str

    env_template: Optional[str] = None