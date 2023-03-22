// Copyright 2013 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "tools/json_schema_compiler/test/error_generation.h"

#include <memory>
#include <vector>

#include "base/json/json_writer.h"
#include "base/logging.h"
#include "base/strings/utf_string_conversions.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "tools/json_schema_compiler/test/test_util.h"

namespace errors = test::api::error_generation;
using base::Value;
using json_schema_compiler::test_util::Dictionary;
using json_schema_compiler::test_util::List;

template <typename T>
std::u16string GetPopulateError(const Value& value) {
  std::u16string error;
  T test_type;
  T::Populate(value, &test_type, &error);
  return error;
}

testing::AssertionResult EqualsUtf16(const std::string& expected,
                                     const std::u16string& actual) {
  if (base::ASCIIToUTF16(expected) == actual)
    return testing::AssertionSuccess();
  return testing::AssertionFailure() << "\n    actual:     " << actual
                                     << "\n    expected:   " << expected;
}

// GenerateTypePopulate errors

TEST(JsonSchemaCompilerErrorTest, RequiredPropertyPopulate) {
  {
    base::Value value = Dictionary("string", Value("bling"));
    EXPECT_TRUE(EqualsUtf16("", GetPopulateError<errors::TestType>(value)));
  }
  {
    Value value(Value::Type::BINARY);
    EXPECT_TRUE(EqualsUtf16("expected dictionary, got binary",
                            GetPopulateError<errors::TestType>(value)));
  }
}

TEST(JsonSchemaCompilerErrorTest, UnexpectedTypePopulation) {
  {
    base::Value value(Value::Type::LIST);
    EXPECT_TRUE(
        EqualsUtf16("", GetPopulateError<errors::ChoiceType::Integers>(value)));
  }
  {
    base::Value value(Value::Type::BINARY);
    EXPECT_TRUE(
        EqualsUtf16("expected integers or integer, got binary",
                    GetPopulateError<errors::ChoiceType::Integers>(value)));
  }
}

// GenerateTypePopulateProperty errors

TEST(JsonSchemaCompilerErrorTest, TypeIsRequired) {
  {
    base::Value value = Dictionary("integers", Value(5));
    EXPECT_TRUE(EqualsUtf16("", GetPopulateError<errors::ChoiceType>(value)));
  }
  {
    base::Value value(base::Value::Type::DICT);
    EXPECT_TRUE(EqualsUtf16("'integers' is required",
                            GetPopulateError<errors::ChoiceType>(value)));
  }
}

// GenerateParamsCheck errors

TEST(JsonSchemaCompilerErrorTest, TooManyParameters) {
  {
    base::Value::List params_value;
    params_value.Append(5);
    std::u16string error;
    EXPECT_TRUE(errors::TestFunction::Params::Create(params_value, &error));
  }
  {
    base::Value::List params_value;
    params_value.Append(5);
    params_value.Append(5);
    std::u16string error;
    EXPECT_FALSE(errors::TestFunction::Params::Create(params_value, &error));
    EXPECT_TRUE(EqualsUtf16("expected 1 arguments, got 2", error));
  }
}

// GenerateFunctionParamsCreate errors

TEST(JsonSchemaCompilerErrorTest, ParamIsRequired) {
  {
    base::Value::List params_value;
    params_value.Append(5);
    std::u16string error;
    EXPECT_TRUE(errors::TestFunction::Params::Create(params_value, &error));
  }
  {
    base::Value::List params_value;
    params_value.Append(base::Value());
    std::u16string error;
    EXPECT_FALSE(errors::TestFunction::Params::Create(params_value, &error));
    EXPECT_TRUE(EqualsUtf16("'num' is required", error));
  }
}

// GeneratePopulateVariableFromValue errors

TEST(JsonSchemaCompilerErrorTest, WrongPropertyValueType) {
  {
    base::Value value = Dictionary("string", Value("yes"));
    EXPECT_TRUE(EqualsUtf16("", GetPopulateError<errors::TestType>(value)));
  }
  {
    base::Value value = Dictionary("string", Value(1.1));
    EXPECT_TRUE(EqualsUtf16("'string': expected string, got double",
                            GetPopulateError<errors::TestType>(value)));
  }
}

TEST(JsonSchemaCompilerErrorTest, WrongParameterCreationType) {
  {
    std::u16string error;
    base::Value::List params_value;
    params_value.Append("Yeah!");
    EXPECT_TRUE(errors::TestString::Params::Create(params_value, &error));
  }
  {
    base::Value::List params_value;
    params_value.Append(5);
    std::u16string error;
    EXPECT_FALSE(
        errors::TestTypeInObject::Params::Create(params_value, &error));
    EXPECT_TRUE(EqualsUtf16("'paramObject': expected dictionary, got integer",
        error));
  }
}

TEST(JsonSchemaCompilerErrorTest, WrongTypeValueType) {
  {
    base::Value value(base::Value::Type::DICTIONARY);
    EXPECT_TRUE(EqualsUtf16("", GetPopulateError<errors::ObjectType>(value)));
  }
  {
    base::Value value = Dictionary("otherType", Value(1.1));
    errors::ObjectType out;
    std::u16string error;
    EXPECT_FALSE(errors::ObjectType::Populate(value, &out, &error));
    EXPECT_TRUE(EqualsUtf16("'otherType': expected dictionary, got double",
        error));
    EXPECT_FALSE(out.other_type.has_value());
  }
}

TEST(JsonSchemaCompilerErrorTest, UnableToPopulateArray) {
  {
    base::Value params_value = List(Value(5));
    EXPECT_TRUE(EqualsUtf16(
        "", GetPopulateError<errors::ChoiceType::Integers>(params_value)));
  }
  {
    base::Value params_value = List(Value(5), Value(false));
    EXPECT_TRUE(EqualsUtf16(
        "Error at key 'integers': Parsing array failed at index 1: expected "
        "integer, got boolean",
        GetPopulateError<errors::ChoiceType::Integers>(params_value)));
  }
}

TEST(JsonSchemaCompilerErrorTest, BinaryTypeExpected) {
  {
    base::Value value = Dictionary("data", Value(Value::Type::BINARY));
    EXPECT_TRUE(EqualsUtf16("", GetPopulateError<errors::BinaryData>(value)));
  }
  {
    base::Value value = Dictionary("data", Value(1.1));
    EXPECT_TRUE(EqualsUtf16("'data': expected binary, got double",
                            GetPopulateError<errors::BinaryData>(value)));
  }
}

TEST(JsonSchemaCompilerErrorTest, ListExpected) {
  {
    base::Value value =
        Dictionary("TheArray", base::Value(base::Value::Type::LIST));
    EXPECT_TRUE(EqualsUtf16("", GetPopulateError<errors::ArrayObject>(value)));
  }
  {
    base::Value value = Dictionary("TheArray", Value(5));
    EXPECT_TRUE(EqualsUtf16("'TheArray': expected list, got integer",
                            GetPopulateError<errors::ArrayObject>(value)));
  }
}

// GenerateStringToEnumConversion errors

TEST(JsonSchemaCompilerErrorTest, BadEnumValue) {
  {
    base::Value value = Dictionary("enumeration", Value("one"));
    EXPECT_TRUE(
        EqualsUtf16("", GetPopulateError<errors::HasEnumeration>(value)));
  }
  {
    base::Value value = Dictionary("enumeration", Value("bad sauce"));
    EXPECT_TRUE(
        EqualsUtf16("'Enumeration': expected \"one\" or \"two\" "
                    "or \"three\", got \"bad sauce\"",
                    GetPopulateError<errors::HasEnumeration>(value)));
  }
}

TEST(JsonSchemaCompilerErrorTest, ErrorOnOptionalFailure) {
  {
    base::Value value = Dictionary("string", Value("bling"));
    EXPECT_TRUE(
        EqualsUtf16("", GetPopulateError<errors::OptionalTestType>(value)));
  }
  {
    base::Value value = Dictionary("string", Value(1));

    errors::OptionalTestType out;
    std::u16string error;
    EXPECT_FALSE(errors::OptionalTestType::Populate(value, &out, &error));
    EXPECT_TRUE(EqualsUtf16("'string': expected string, got integer",
        error));
    EXPECT_FALSE(out.string);
  }
}

TEST(JsonSchemaCompilerErrorTest, OptionalBinaryTypeFailure) {
  {
    base::Value value = Dictionary("data", Value(Value::Type::BINARY));
    EXPECT_TRUE(
        EqualsUtf16("", GetPopulateError<errors::OptionalBinaryData>(value)));
  }
  {
    // There's a bug with silent failures if the key doesn't exist.
    base::Value value = Dictionary("data", Value(1));

    errors::OptionalBinaryData out;
    std::u16string error;
    EXPECT_FALSE(errors::OptionalBinaryData::Populate(value, &out, &error));
    EXPECT_TRUE(EqualsUtf16("'data': expected binary, got integer",
        error));
    EXPECT_FALSE(out.data.has_value());
  }
}

TEST(JsonSchemaCompilerErrorTest, OptionalArrayTypeFailure) {
  {
    base::Value value =
        Dictionary("TheArray", base::Value(base::Value::Type::LIST));
    EXPECT_TRUE(EqualsUtf16("", GetPopulateError<errors::ArrayObject>(value)));
  }
  {
    base::Value value = Dictionary("TheArray", Value(5));
    errors::ArrayObject out;
    std::u16string error;
    EXPECT_FALSE(errors::ArrayObject::Populate(value, &out, &error));
    EXPECT_TRUE(EqualsUtf16("'TheArray': expected list, got integer",
        error));
    EXPECT_FALSE(out.the_array.has_value());
  }
}

TEST(JsonSchemaCompilerErrorTest, OptionalUnableToPopulateArray) {
  {
    base::Value params_value = List(Value(5));
    EXPECT_TRUE(EqualsUtf16(
        "",
        GetPopulateError<errors::OptionalChoiceType::Integers>(params_value)));
  }
  {
    base::Value params_value = List(Value(5), Value(false));
    errors::OptionalChoiceType::Integers out;
    std::u16string error;
    EXPECT_FALSE(errors::OptionalChoiceType::Integers::Populate(params_value,
                                                                &out, &error));
    EXPECT_TRUE(
        EqualsUtf16("Error at key 'integers': Parsing array failed at index 1: "
                    "expected integer, got boolean",
                    error));
    EXPECT_FALSE(out.as_integer.has_value());
  }
}

TEST(JsonSchemaCompilerErrorTest, TooManyKeys) {
  {
    base::Value value = Dictionary("string", Value("yes"));
    EXPECT_TRUE(EqualsUtf16("", GetPopulateError<errors::TestType>(value)));
  }
  {
    // We simply ignore extra keys.
    base::Value value =
        Dictionary("string", Value("yes"), "ohno", Value("many values"));
    EXPECT_TRUE(EqualsUtf16("", GetPopulateError<errors::TestType>(value)));
  }
}
