// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This file was generated by:
//   tools/json_schema_compiler/compiler.py.
// NOTE: The format of types has changed. 'FooType' is now
//   'chrome.bookmarks.FooType'.
// Please run the closure compiler before committing changes.
// See https://chromium.googlesource.com/chromium/src/+/main/docs/closure_compilation.md

/**
 * @fileoverview Externs generated from namespace: bookmarks
 * @externs
 */

/** @const */
chrome.bookmarks = {};

/**
 * @enum {string}
 * @see https://developer.chrome.com/extensions/bookmarks#type-BookmarkTreeNodeUnmodifiable
 */
chrome.bookmarks.BookmarkTreeNodeUnmodifiable = {
  MANAGED: 'managed',
};

/**
 * A node (either a bookmark or a folder) in the bookmark tree.  Child nodes are ordered within their parent folder.
 * @typedef {{
 *   id: string,
 *   parentId: (string|undefined),
 *   index: (number|undefined),
 *   url: (string|undefined),
 *   title: string,
 *   dateAdded: (number|undefined),
 *   dateGroupModified: (number|undefined),
 *   unmodifiable: (!chrome.bookmarks.BookmarkTreeNodeUnmodifiable|undefined),
 *   children: (!Array<!chrome.bookmarks.BookmarkTreeNode>|undefined)
 * }}
 * @see https://developer.chrome.com/extensions/bookmarks#type-BookmarkTreeNode
 */
chrome.bookmarks.BookmarkTreeNode;

/**
 * Object passed to the create() function.
 * @typedef {{
 *   parentId: (string|undefined),
 *   index: (number|undefined),
 *   title: (string|undefined),
 *   url: (string|undefined)
 * }}
 * @see https://developer.chrome.com/extensions/bookmarks#type-CreateDetails
 */
chrome.bookmarks.CreateDetails;

/**
 * @type {number}
 * @see https://developer.chrome.com/extensions/bookmarks#type-MAX_WRITE_OPERATIONS_PER_HOUR
 */
chrome.bookmarks.MAX_WRITE_OPERATIONS_PER_HOUR;

/**
 * @type {number}
 * @see https://developer.chrome.com/extensions/bookmarks#type-MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE
 */
chrome.bookmarks.MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE;

/**
 * Retrieves the specified BookmarkTreeNode(s).
 * @param {(string|!Array<string>)} idOrIdList A single string-valued id, or an
 *     array of string-valued ids
 * @param {function(!Array<!chrome.bookmarks.BookmarkTreeNode>): void} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-get
 */
chrome.bookmarks.get = function(idOrIdList, callback) {};

/**
 * Retrieves the children of the specified BookmarkTreeNode id.
 * @param {string} id
 * @param {function(!Array<!chrome.bookmarks.BookmarkTreeNode>): void} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-getChildren
 */
chrome.bookmarks.getChildren = function(id, callback) {};

/**
 * Retrieves the recently added bookmarks.
 * @param {number} numberOfItems The maximum number of items to return.
 * @param {function(!Array<!chrome.bookmarks.BookmarkTreeNode>): void} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-getRecent
 */
chrome.bookmarks.getRecent = function(numberOfItems, callback) {};

/**
 * Retrieves the entire Bookmarks hierarchy.
 * @param {function(!Array<!chrome.bookmarks.BookmarkTreeNode>): void} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-getTree
 */
chrome.bookmarks.getTree = function(callback) {};

/**
 * Retrieves part of the Bookmarks hierarchy, starting at the specified node.
 * @param {string} id The ID of the root of the subtree to retrieve.
 * @param {function(!Array<!chrome.bookmarks.BookmarkTreeNode>): void} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-getSubTree
 */
chrome.bookmarks.getSubTree = function(id, callback) {};

/**
 * Searches for BookmarkTreeNodes matching the given query. Queries specified
 * with an object produce BookmarkTreeNodes matching all specified properties.
 * @param {(string|{
 *   query: (string|undefined),
 *   url: (string|undefined),
 *   title: (string|undefined)
 * })} query Either a string of words and quoted phrases that are matched
 *     against bookmark URLs and titles, or an object. If an object, the
 *     properties <code>query</code>, <code>url</code>, and <code>title</code>
 *     may be specified and bookmarks matching all specified properties will be
 *     produced.
 * @param {function(!Array<!chrome.bookmarks.BookmarkTreeNode>): void} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-search
 */
chrome.bookmarks.search = function(query, callback) {};

/**
 * Creates a bookmark or folder under the specified parentId.  If url is NULL or
 * missing, it will be a folder.
 * @param {!chrome.bookmarks.CreateDetails} bookmark
 * @param {function(!chrome.bookmarks.BookmarkTreeNode): void=} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-create
 */
chrome.bookmarks.create = function(bookmark, callback) {};

/**
 * Moves the specified BookmarkTreeNode to the provided location.
 * @param {string} id
 * @param {{
 *   parentId: (string|undefined),
 *   index: (number|undefined)
 * }} destination
 * @param {function(!chrome.bookmarks.BookmarkTreeNode): void=} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-move
 */
chrome.bookmarks.move = function(id, destination, callback) {};

/**
 * Updates the properties of a bookmark or folder. Specify only the properties
 * that you want to change; unspecified properties will be left unchanged.
 * <b>Note:</b> Currently, only 'title' and 'url' are supported.
 * @param {string} id
 * @param {{
 *   title: (string|undefined),
 *   url: (string|undefined)
 * }} changes
 * @param {function(!chrome.bookmarks.BookmarkTreeNode): void=} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-update
 */
chrome.bookmarks.update = function(id, changes, callback) {};

/**
 * Removes a bookmark or an empty bookmark folder.
 * @param {string} id
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-remove
 */
chrome.bookmarks.remove = function(id, callback) {};

/**
 * Recursively removes a bookmark folder.
 * @param {string} id
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-removeTree
 */
chrome.bookmarks.removeTree = function(id, callback) {};

/**
 * Imports bookmarks from a Chrome html bookmark file
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-import
 */
chrome.bookmarks.import = function(callback) {};

/**
 * Exports bookmarks to a Chrome html bookmark file
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/bookmarks#method-export
 */
chrome.bookmarks.export = function(callback) {};

/**
 * Fired when a bookmark or folder is created.
 * @type {!ChromeEvent}
 * @see https://developer.chrome.com/extensions/bookmarks#event-onCreated
 */
chrome.bookmarks.onCreated;

/**
 * Fired when a bookmark or folder is removed.  When a folder is removed
 * recursively, a single notification is fired for the folder, and none for its
 * contents.
 * @type {!ChromeEvent}
 * @see https://developer.chrome.com/extensions/bookmarks#event-onRemoved
 */
chrome.bookmarks.onRemoved;

/**
 * Fired when a bookmark or folder changes.  <b>Note:</b> Currently, only title
 * and url changes trigger this.
 * @type {!ChromeEvent}
 * @see https://developer.chrome.com/extensions/bookmarks#event-onChanged
 */
chrome.bookmarks.onChanged;

/**
 * Fired when a bookmark or folder is moved to a different parent folder.
 * @type {!ChromeEvent}
 * @see https://developer.chrome.com/extensions/bookmarks#event-onMoved
 */
chrome.bookmarks.onMoved;

/**
 * Fired when the children of a folder have changed their order due to the order
 * being sorted in the UI.  This is not called as a result of a move().
 * @type {!ChromeEvent}
 * @see https://developer.chrome.com/extensions/bookmarks#event-onChildrenReordered
 */
chrome.bookmarks.onChildrenReordered;

/**
 * Fired when a bookmark import session is begun.  Expensive observers should
 * ignore onCreated updates until onImportEnded is fired.  Observers should
 * still handle other notifications immediately.
 * @type {!ChromeEvent}
 * @see https://developer.chrome.com/extensions/bookmarks#event-onImportBegan
 */
chrome.bookmarks.onImportBegan;

/**
 * Fired when a bookmark import session is ended.
 * @type {!ChromeEvent}
 * @see https://developer.chrome.com/extensions/bookmarks#event-onImportEnded
 */
chrome.bookmarks.onImportEnded;