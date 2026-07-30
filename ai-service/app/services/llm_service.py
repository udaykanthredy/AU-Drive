"""
LLM service — unified wrapper for Gemini and OpenAI.

Priority:
  1. If GEMINI_API_KEY is set  → use Gemini (gemini-1.5-flash, free tier)
  2. If OPENAI_API_KEY is set  → use OpenAI (gpt-4o-mini, paid)
  3. Neither set               → raises ConfigurationError on first call

The service is a singleton. The LLM client is lazy-loaded on first use.
"""

import json
import logging
import re
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)


class LLMConfigurationError(Exception):
    """Raised when no LLM API key is configured."""
    pass


class LLMService:
    """
    Unified LLM wrapper. Supports Gemini (primary) and OpenAI (fallback).
    Client is lazy-loaded on first generate() call.
    """

    def __init__(self):
        self._provider: Optional[str] = None
        self._client = None

    def _initialize(self):
        """Detect which provider to use and initialize the client."""
        if self._provider is not None:
            return  # Already initialized

        if settings.GEMINI_API_KEY:
            self._provider = "gemini"
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._client = genai.GenerativeModel(model_name="gemini-3.5-flash")
            logger.info("LLM provider: Gemini (gemini-3.5-flash)")

        elif settings.OPENAI_API_KEY:
            self._provider = "openai"
            from openai import AsyncOpenAI
            
            client_kwargs = {"api_key": settings.OPENAI_API_KEY}
            if getattr(settings, "OPENAI_API_BASE", None):
                client_kwargs["base_url"] = settings.OPENAI_API_BASE
                
            self._client = AsyncOpenAI(**client_kwargs)
            logger.info(f"LLM provider: OpenAI / Custom ({settings.LLM_MODEL})")

        else:
            raise LLMConfigurationError(
                "No LLM API key configured. "
                "Set GEMINI_API_KEY or OPENAI_API_KEY in your .env file."
            )

    async def generate(self, prompt: str) -> str:
        """
        Send a prompt to the configured LLM and return the text response.

        Args:
            prompt: The full prompt string to send.

        Returns:
            The LLM's text response.

        Raises:
            LLMConfigurationError: If no API key is set.
        """
        self._initialize()

        logger.debug(f"Sending prompt to {self._provider} ({len(prompt)} chars)")

        if self._provider == "gemini":
            return await self._generate_gemini(prompt)
        elif self._provider == "openai":
            return await self._generate_openai(prompt)

    async def _generate_gemini(self, prompt: str) -> str:
        """Call Gemini API asynchronously."""
        import asyncio
        import functools

        # google-generativeai doesn't have native async in older versions;
        # run the sync call in a thread pool to avoid blocking the event loop.
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            functools.partial(self._client.generate_content, prompt)
        )
        return response.text

    async def _generate_openai(self, prompt: str) -> str:
        """Call OpenAI chat completions API asynchronously."""
        response = await self._client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=settings.MAX_TOKENS,
            temperature=settings.TEMPERATURE,
        )
        return response.choices[0].message.content

    @property
    def is_configured(self) -> bool:
        """Returns True if at least one LLM API key is set."""
        return bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)

    @property
    def provider_name(self) -> Optional[str]:
        """Returns the active provider name, or None if not yet initialized."""
        return self._provider


# Singleton — initialized once and reused across requests
llm_service = LLMService()
