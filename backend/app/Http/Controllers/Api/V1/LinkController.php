<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Links\StoreLinkRequest;
use App\Http\Requests\Links\UpdateLinkRequest;
use App\Http\Resources\LinkResource;
use App\Models\Link;
use App\Services\UrlShorteningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LinkController extends Controller
{
    public function __construct(private readonly UrlShorteningService $shortener) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $links = Link::query()->whereBelongsTo($request->user())->with('tags')
            ->when($request->string('search')->toString(), fn ($q, $search) => $q->where(fn ($sub) => $sub->where('title', 'like', "%{$search}%")->orWhere('short_code', 'like', "%{$search}%")->orWhere('destination_url', 'like', "%{$search}%")))
            ->when($request->get('status') === 'active', fn ($q) => $q->where('is_active', true)->where(fn ($x) => $x->whereNull('expires_at')->orWhere('expires_at', '>', now())))
            ->when($request->get('status') === 'disabled', fn ($q) => $q->where('is_active', false))
            ->when($request->get('status') === 'expired', fn ($q) => $q->where('expires_at', '<=', now()))
            ->orderBy(in_array($request->get('sort'), ['created_at', 'clicks_count', 'title', 'expires_at'], true) ? $request->get('sort') : 'created_at', $request->get('direction') === 'asc' ? 'asc' : 'desc')
            ->paginate(min(max($request->integer('per_page', 15), 1), 100));

        return LinkResource::collection($links);
    }

    public function store(StoreLinkRequest $request): JsonResponse
    {
        $link = $this->shortener->create($request->validated(), $request->user());

        return response()->json(['data' => new LinkResource($link), 'message' => 'Short link created.'], 201);
    }

    public function storeAnonymous(StoreLinkRequest $request): JsonResponse
    {
        abort_unless(config('shortener.allow_anonymous'), 403, 'Anonymous link creation is disabled.');
        $data = $request->safe()->only(['destination_url', 'custom_alias']);
        $link = $this->shortener->create($data, null);

        return response()->json(['data' => new LinkResource($link), 'message' => 'Short link created.'], 201);
    }

    public function show(Request $request, Link $link): LinkResource
    {
        $this->authorize('view', $link);

        return new LinkResource($link->load('tags'));
    }

    public function update(UpdateLinkRequest $request, Link $link): JsonResponse
    {
        return response()->json(['data' => new LinkResource($this->shortener->update($link, $request->validated())), 'message' => 'Link updated.']);
    }

    public function destroy(Request $request, Link $link): JsonResponse
    {
        $this->authorize('delete', $link);
        $code = $link->short_code;
        $link->delete();
        $this->shortener->forget($code);

        return response()->json(['data' => null, 'message' => 'Link deleted.']);
    }
}
