<?php

namespace App\Http\Controllers;

use App\Models\VectorKnowledgeBase;
use App\Services\VectorRagService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RagChatController extends Controller
{
    protected VectorRagService $ragService;

    public function __construct(VectorRagService $ragService)
    {
        $this->ragService = $ragService;
    }

    /**
     * Ask Question with Vector Database RAG Retrieval
     */
    public function ask(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'nullable|array',
        ]);

        $message = $request->input('message');
        $history = $request->input('history', []);

        $ragResult = $this->ragService->answerQuestionWithRag($message, $history);

        return response()->json([
            'success' => true,
            'reply' => $ragResult['reply'],
            'detected_language' => $ragResult['detected_language'],
            'retrieved_sources' => $ragResult['retrieved_sources'],
            'extracted_items' => $ragResult['extracted_items'],
            'context_used' => $ragResult['context_used'],
            'has_retrieval' => $ragResult['has_retrieval'],
        ]);
    }

    /**
     * Re-index All Menu Items and Policies into Vector Database
     */
    public function reindex(): JsonResponse
    {
        $totalIndexed = $this->ragService->seedVectorStore();

        return response()->json([
            'message' => "Successfully indexed {$totalIndexed} documents into Vector Knowledge Base.",
            'total_vectors' => $totalIndexed,
        ]);
    }

    /**
     * Check Vector Store Status & Diagnostics
     */
    public function status(): JsonResponse
    {
        $count = VectorKnowledgeBase::count();
        $sample = VectorKnowledgeBase::first();

        return response()->json([
            'vector_count' => $count,
            'dimensions' => 64,
            'embedding_type' => 'Dense Normalized Semantic Vector (Cosine Distance)',
            'sample_titles' => VectorKnowledgeBase::pluck('title')->take(5),
        ]);
    }
}
